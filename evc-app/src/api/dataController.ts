
import { getRepository, getManager, LessThan } from 'typeorm';
import { handlerWrapper } from '../utils/asyncHandler';
import { assert, assertRole } from '../utils/assert';
import { User } from '../entity/User';
import { uploadToS3 } from '../utils/uploadToS3';
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

function handleCsvUpload(onRows: (rows: []) => Promise<void>, onFinish: () => Promise<void> = async () => { }) {
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
      const list = parse(data, {
        columns: headers => headers.map(convertHeaderToPropName),
        skip_empty_lines: true
      });

      const chunks = _.chunk(list, 1000);

      for (const rows of chunks) {
        await onRows(rows);
      }

      await onFinish();
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

export const uploadSupportCsv = handleCsvUpload(async rows => {
  await getManager()
    .createQueryBuilder()
    .insert()
    .into(StockSupport)
    .values(rows as StockSupport[])
    .orIgnore()
    .execute();
})

export const uploadResistanceCsv = handleCsvUpload(async rows => {
  await getManager()
    .createQueryBuilder()
    .insert()
    .into(StockResistance)
    .values(rows as StockResistance[])
    .orIgnore()
    .execute();
})

export const uploadPutCallRatioCsv = handleCsvUpload(async rows => {
  const formattedRows = rows.map(formatPutCallRatioUploadRow);
  await getManager()
    .createQueryBuilder()
    .insert()
    .into(StockDailyPutCallRatio)
    .values(formattedRows as StockDailyPutCallRatio[])
    .onConflict(`(symbol, date) DO UPDATE SET "putCallRatio" = excluded."putCallRatio"`)
    .execute();
})

async function cleanUpOldUoaData(table) {
  const now = getUtcNow();
  const threeMonthAgo = moment(now).add(-3, 'month').toDate();

  await getManager()
    .createQueryBuilder()
    .delete()
    .from(table)
    .where('time < :date', { date: threeMonthAgo })
    .execute();
}

export const uploadUoaStockCsv = handleCsvUpload(
  async rows => {
    const formattedRows = rows.map(formatUoaUploadRow);
    await getManager()
      .createQueryBuilder()
      .insert()
      .into(UnusalOptionActivityStock)
      .values(formattedRows as UnusalOptionActivityStock[])
      .execute();
  },
  () => cleanUpOldUoaData(UnusalOptionActivityStock)
);

export const uploadUoaEtfsCsv = handleCsvUpload(
  async rows => {
    await getManager()
      .createQueryBuilder()
      .insert()
      .into(UnusalOptionActivityEtfs)
      .values(rows as UnusalOptionActivityEtfs[])
      .execute();
  },
  () => cleanUpOldUoaData(UnusalOptionActivityEtfs)
);

export const uploadUoaIndexCsv = handleCsvUpload(
  async rows => {
    await getManager()
      .createQueryBuilder()
      .insert()
      .into(UnusalOptionActivityIndex)
      .values(rows as UnusalOptionActivityIndex[])
      .execute();
  },
  () => cleanUpOldUoaData(UnusalOptionActivityIndex)
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
