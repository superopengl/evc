
import { getManager, EntityManager, In } from 'typeorm';
import { handlerWrapper } from '../utils/asyncHandler';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
import path from 'path';
import { refreshMaterializedView } from "../refreshMaterializedView";
import { redisCache } from '../services/redisCache';
import parse from 'csv-parse/lib/sync';
import { StockSupport } from '../entity/StockSupport';
import { StockResistance } from '../entity/StockResistance';
import { UnusualOptionActivityStock } from '../entity/UnusualOptionActivityStock';
import { UnusualOptionActivityEtfs } from '../entity/UnusualOptionActivityEtfs';
import { UnusualOptionActivityIndex } from '../entity/UnusualOptionActivityIndex';
import { searchUnusualOptionsActivity } from '../utils/searchUnusualOptionsActivity';
import { getUtcNow } from '../utils/getUtcNow';
import moment from 'moment';
import _ from 'lodash';
import { Role } from '../types/Role';
import { StockDailyAdvancedStat } from '../entity/StockDailyAdvancedStat';

const convertHeaderToPropName = header => {
  return header.split(' ')
    .map(x => x.replace(/[\/ ]/g, ''))
    .map((w, i) => i === 0 ? w.toLowerCase() : _.capitalize(w))
    .join('');
}

const formatUoaUploadRow = row => {
  try {
    row.expDate = parseUoaDate(row.expDate);
    row.tradeDate = parseUoaDate(row.time);
    row.iv = row.iv.replace(/%/g, '');
    return row;
  } catch (e) {
    throw new Error(`${e.message} from row: ${Object.values(row).join(',')}`)
  }
}

const formatPutCallRatioUploadRow = row => {
  row.date = moment(row.date, 'MM/DD/YY').toDate();
  return row;
}

function parseUoaDate(value) {
  let m = moment(value, 'MM/DD/YY');
  if (!m.isValid()) {
    m = moment(value, 'YYYY/MM/DD')
  }
  if (!m.isValid()) {
    throw new Error(`'${value}' is not a valid date.`)
  }
  return m.toDate();
}

function parseUoaTime(value) {
  if (!value) return null;
  const m = moment(value, 'H:mm [ET]');
  if (!m.isValid()) {
    throw new Error(`'${value}' is not a valid time.`)
  }

  return m.format('H:mm');
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
  refreshMaterializedView();
  res.json();
});

export const flushCache = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const key = `operation.status.flush_cache`;
  await redisCache.set(key, 'in-progress');
  redisCache.flush().finally(() => {
    redisCache.del(key);
  });
  res.json();
});

function parseLoHi(strData: string, rowNumber: number) {
  assert(strData?.trim(), 400, `Empty lo-hi pair value`)
  const [loStr, hiStr] = strData.split('-');
  const lo = +(loStr?.trim());
  let hi = +(hiStr?.trim());
  if (_.isNaN(hi)) {
    hi = lo;
  }
  assert(_.isFinite(lo) && _.isFinite(hi), 400, `Invalid lo-hi pair value '${strData}' from line ${rowNumber}`);
  return { lo, hi };
}

function formatSupportResistanceRowsToEntites(rows) {
  const supports: StockSupport[] = [];
  const resistances: StockResistance[] = [];
  let currentSymbol;
  let rowNumber = 2; // Because we skipped the header line, the data line starts from 2.
  for (const row of rows) {
    const { symbol, support, resistance } = row;
    currentSymbol = symbol?.trim() || currentSymbol;
    const supportData = support?.trim();
    const resistanceData = resistance?.trim();
    assert(currentSymbol, 400, `Cannot find symbol from line ${rowNumber}`);
    if (supportData) {
      const { lo, hi } = parseLoHi(supportData, rowNumber);
      const entity = new StockSupport();
      entity.symbol = currentSymbol;
      entity.lo = lo;
      entity.hi = hi;
      supports.push(entity);
    }
    if (resistanceData) {
      const { lo, hi } = parseLoHi(resistanceData, rowNumber);
      const entity = new StockResistance();
      entity.symbol = currentSymbol;
      entity.lo = lo;
      entity.hi = hi;
      resistances.push(entity);
    }

    rowNumber++;
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
        .into(StockDailyAdvancedStat)
        .values(formattedRows as StockDailyAdvancedStat[])
        .onConflict(`(symbol, date) DO UPDATE SET "putCallRatio" = excluded."putCallRatio"`)
        .execute();
    }
  })

async function cleanUpOldUoaData(m: EntityManager, table) {
  const now = getUtcNow();
  const oneYearAgo = moment(now).add(-1, 'year').startOf('day').toDate();

  await m
    .createQueryBuilder()
    .delete()
    .from(table)
    .where('"tradeDate" < :date', { date: oneYearAgo })
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
        .into(UnusualOptionActivityStock)
        .values(formattedRows as UnusualOptionActivityStock[])
        .orIgnore()
        .execute();
    }
    await cleanUpOldUoaData(m, UnusualOptionActivityStock);
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
        .into(UnusualOptionActivityEtfs)
        .values(formattedRows as UnusualOptionActivityEtfs[])
        .orIgnore()
        .execute();
    }
    await cleanUpOldUoaData(m, UnusualOptionActivityEtfs);
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
        .into(UnusualOptionActivityIndex)
        .values(formattedRows as UnusualOptionActivityIndex[])
        .orIgnore()
        .execute();
    }
    await cleanUpOldUoaData(m, UnusualOptionActivityIndex);
  }
);

function shouldShowFullDataForUoa(req) {
  const { user } = req as any;
  const role = user?.role || Role.Guest;
  return [Role.Admin, Role.Agent, Role.Member].includes(role);
}

export const listUoaStocks = handlerWrapper(async (req, res) => {
  const showFullData = shouldShowFullDataForUoa(req);
  const list = await searchUnusualOptionsActivity('stock', req.body, showFullData);
  res.set('Cache-Control', `public, max-age=1800`);
  res.json(list);
});

export const listUoaEtfs = handlerWrapper(async (req, res) => {
  const showFullData = shouldShowFullDataForUoa(req);
  const list = await searchUnusualOptionsActivity('etfs', req.body, showFullData);
  res.set('Cache-Control', `public, max-age=1800`);
  res.json(list);
});

export const listUoaindex = handlerWrapper(async (req, res) => {
  const showFullData = shouldShowFullDataForUoa(req);
  const list = await searchUnusualOptionsActivity('index', req.body, showFullData);
  res.set('Cache-Control', `public, max-age=1800`);
  res.json(list);
});

export const listAdminUoaStocks = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const showFullData = shouldShowFullDataForUoa(req);
  const list = await searchUnusualOptionsActivity('stock', req.body, showFullData);
  res.json(list);
});

export const listAdminUoaEtfs = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const showFullData = shouldShowFullDataForUoa(req);
  const list = await searchUnusualOptionsActivity('etfs', req.body, showFullData);
  res.json(list);
});

export const listAdminUoaIndex = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const showFullData = shouldShowFullDataForUoa(req);
  const list = await searchUnusualOptionsActivity('index', req.body, showFullData);
  res.json(list);
});

export const getOperationStatus = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { operation } = req.params;
  const key = `operation.status.${operation}`;
  const value = await redisCache.get(key);
  res.json(value);
});

export const getCacheKeys = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const value = await redisCache.keys();
  res.json(value);
});

export const deleteCacheKey = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { key } = req.params;
  assert(key, 400, 'key is not specified');
  const value = await redisCache.del(key);
  res.json(value);
});

export const getCacheValue = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { key } = req.params;
  assert(key, 400, 'key is not specified');
  const value = await redisCache.get(key);
  res.json(value);
});



