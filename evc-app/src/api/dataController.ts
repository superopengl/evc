
import { getManager, EntityManager, In } from 'typeorm';
import { handlerWrapper } from '../utils/asyncHandler';
import { assert, assertRole } from '../utils/assert';
import * as path from 'path';
import { refreshMaterializedView } from '../db';
import { redisCache } from '../services/redisCache';
import * as parse from 'csv-parse/lib/sync';
import { StockSupport } from '../entity/StockSupport';
import { StockResistance } from '../entity/StockResistance';
import { UnusalOptionActivityStock } from '../entity/UnusalOptionActivityStock';
import { UnusalOptionActivityEtfs } from '../entity/UnusalOptionActivityEtfs';
import { UnusalOptionActivityIndex } from '../entity/UnusalOptionActivityIndex';
import { searchUnusalOptionsActivity } from '../utils/searchUnusalOptionsActivity';
import { StockDailyPutCallRatio } from '../entity/StockDailyPutCallRatio';
import { getUtcNow } from '../utils/getUtcNow';
import * as moment from 'moment';
import * as _ from 'lodash';

const convertHeaderToPropName = header => {
  return header.split(' ')
    .map(x => x.replace(/[\/ ]/g, ''))
    .map((w, i) => i === 0 ? w.toLowerCase() : _.capitalize(w))
    .join('');
}

const formatUoaUploadRow = row => {
  row.expDate = moment(row.expDate, 'MM/DD/YY').toDate();
  row.time = moment(row.time, 'MM/DD/YY').toDate();
  row.iv = row.iv.replace(/%/g, '');
  return row;
}

const formatPutCallRatioUploadRow = row => {
  row.date = moment(row.date, 'MM/DD/YY').toDate();
  return row;
}

function handleCsvUpload(
  onRows: (m: EntityManager, rows: []) => Promise<void>,
) {
  return handlerWrapper(async (req, res) => {
    assertRole(req, 'admin', 'agent');

    const { operation } = req.query;
    assert(operation, 400, 'operation query param is required');

    const { file } = (req as any).files;
    assert(file, 404, 'No file to upload');
    const { name, data, mimetype, md5 } = file;
    assert(path.extname(name).toLowerCase() === '.csv', 400, 'Not a csv file');

    const key = `operation.status.${operation}`;
    try {
      await redisCache.set(key, 'in-progress');
      const rows = parse(data, {
        columns: headers => headers.map(convertHeaderToPropName),
        skip_empty_lines: true
      });

      await getManager().transaction(async m => {
        await onRows(m, rows);
      });

    } finally {
      await redisCache.del(key);
    }

    res.json();
  });
}

export const refreshMaterializedViews = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { operation } = req.query;
  assert(operation, 400, 'operation query param is required');
  const key = `operation.status.${operation}`;
  await redisCache.set(key, 'in-progress');
  refreshMaterializedView().finally(() => {
    redisCache.del(key);
  });
  res.json();
});

export const flushCache = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { operation } = req.query;
  assert(operation, 400, 'operation query param is required');
  const key = `operation.status.${operation}`;
  await redisCache.set(key, 'in-progress');
  redisCache.flush().finally(() => {
    redisCache.del(key);
  });
  res.json();
});

function parseLoHi(strData) {
  assert(strData?.trim(), 400, `Empty lo-hi pair value`)
  const [loStr, hiStr] = strData.split('-');
  const lo = +(loStr?.trim());
  let hi = +(hiStr?.trim());
  if (_.isNaN(hi)) {
    hi = lo;
  }
  assert(_.isFinite(lo) && _.isFinite(hi), 400, `Invalid lo-hi pair value ${strData}`);
  return { lo, hi };
}

function formatSupportResistanceRowsToEntites(rows) {
  const supports: StockSupport[] = [];
  const resistances: StockResistance[] = [];
  let currentSymbol;
  for (const row of rows) {
    const { symbol, support, resistance } = row;
    currentSymbol = symbol || currentSymbol;
    const supportData = support?.trim();
    const resistanceData = resistance?.trim();
    assert(currentSymbol, 400, 'Cannot find symbol');
    assert(supportData || resistanceData, 400, 'Neither support nor resistance is provided');
    if (supportData) {
      const { lo, hi } = parseLoHi(supportData);
      const entity = new StockSupport();
      entity.symbol = currentSymbol;
      entity.lo = lo;
      entity.hi = hi;
      supports.push(entity);
    }
    if (resistanceData) {
      const { lo, hi } = parseLoHi(resistanceData);
      const entity = new StockResistance();
      entity.symbol = currentSymbol;
      entity.lo = lo;
      entity.hi = hi;
      resistances.push(entity);
    }
  }

  return { supports, resistances };
}

async function deleteAndInsertIntoSupportOrResistance(m: EntityManager, entity, items: StockSupport[] | StockResistance) {
  const symbols = _.chain(items).map(x => x.symbol).uniq().value();
  await m
    .getRepository(entity)
    .delete({ symbol: In(symbols) });

  const chunks = _.chunk(items, 1000);
  for (const rows of chunks) {
    await m
      .createQueryBuilder()
      .insert()
      .into(entity)
      .values(rows)
      .orIgnore()
      .execute();
  }
}

export const uploadSupportResistanceCsv = handleCsvUpload(
  async (m, allRows) => {
    const { supports, resistances } = formatSupportResistanceRowsToEntites(allRows);
    await deleteAndInsertIntoSupportOrResistance(m, StockSupport, supports);
    await deleteAndInsertIntoSupportOrResistance(m, StockResistance, resistances);
  },
)

export const uploadPutCallRatioCsv = handleCsvUpload(
  async (m, allRows) => {
    const chunks = _.chunk(allRows, 1000);
    for (const rows of chunks) {
      const formattedRows = rows.map(formatPutCallRatioUploadRow);
      await m
        .createQueryBuilder()
        .insert()
        .into(StockDailyPutCallRatio)
        .values(formattedRows as StockDailyPutCallRatio[])
        .onConflict(`(symbol, date) DO UPDATE SET "putCallRatio" = excluded."putCallRatio"`)
        .execute();
    }
  })

async function cleanUpOldUoaData(m: EntityManager, table) {
  const now = getUtcNow();
  const threeMonthAgo = moment(now).add(-3, 'month').toDate();

  await m
    .createQueryBuilder()
    .delete()
    .from(table)
    .where('time < :date', { date: threeMonthAgo })
    .execute();
}

export const uploadUoaStockCsv = handleCsvUpload(
  async (m, allRows) => {
    const chunks = _.chunk(allRows, 1000);
    for (const rows of chunks) {
      const formattedRows = rows.map(formatUoaUploadRow);
      await m
        .createQueryBuilder()
        .insert()
        .into(UnusalOptionActivityStock)
        .values(formattedRows as UnusalOptionActivityStock[])
        .execute();
    }
    await cleanUpOldUoaData(m, UnusalOptionActivityStock);
  }
);

export const uploadUoaEtfsCsv = handleCsvUpload(
  async (m, allRows) => {
    const chunks = _.chunk(allRows, 1000);
    for (const rows of chunks) {
      const formattedRows = rows.map(formatUoaUploadRow);
      await m
        .createQueryBuilder()
        .insert()
        .into(UnusalOptionActivityEtfs)
        .values(formattedRows as UnusalOptionActivityEtfs[])
        .execute();
    }
    await cleanUpOldUoaData(m, UnusalOptionActivityEtfs);
  }
);

export const uploadUoaIndexCsv = handleCsvUpload(
  async (m, allRows) => {
    const chunks = _.chunk(allRows, 1000);
    for (const rows of chunks) {
      const formattedRows = rows.map(formatUoaUploadRow);
      await m
        .createQueryBuilder()
        .insert()
        .into(UnusalOptionActivityIndex)
        .values(formattedRows as UnusalOptionActivityIndex[])
        .execute();
    }
    await cleanUpOldUoaData(m, UnusalOptionActivityIndex);
  }
);

export const listUoaStocks = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'member');
  const list = await searchUnusalOptionsActivity('stock', req.query);
  res.set('Cache-Control', `public, max-age=1800`);
  res.json(list);
});

export const listUoaEtfs = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'member');
  const list = await searchUnusalOptionsActivity('etfs', req.query);
  res.set('Cache-Control', `public, max-age=1800`);
  res.json(list);
});

export const listUoaindex = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'member');
  const list = await searchUnusalOptionsActivity('index', req.query);
  res.set('Cache-Control', `public, max-age=1800`);
  res.json(list);
});

export const getOperationStatus = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { operation } = req.params;
  const key = `operation.status.${operation}`;
  const value = await redisCache.get(key);
  res.json(value);
});
