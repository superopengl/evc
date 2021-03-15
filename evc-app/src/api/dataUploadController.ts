
import { getRepository, getManager } from 'typeorm';
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
import { UnusalOptionActivities } from '../entity/UnusalOptionActivities';

function handleCsvUpload(onRow: (row: object) => Promise<void>) {
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
        columns: true,
        skip_empty_lines: true
      });
      for (const row of rows) {
        await onRow(row);
      }
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

export const uploadSupportCsv = handleCsvUpload(async row => {
  await getManager()
    .createQueryBuilder()
    .insert()
    .into(StockSupport)
    .values(row as StockSupport)
    .onConflict(`(symbol, lo, hi) DO NOTHING`)
    .execute();
})

export const uploadResistanceCsv = handleCsvUpload(async row => {
  await getManager()
    .createQueryBuilder()
    .insert()
    .into(StockResistance)
    .values(row as StockResistance)
    .onConflict(`(symbol, lo, hi) DO NOTHING`)
    .execute();
})

export const uploadUnusalOptionActivityCsv = handleCsvUpload(async row => {
  await getManager()
    .createQueryBuilder()
    .insert()
    .into(UnusalOptionActivities)
    .values(row as UnusalOptionActivities)
    .onConflict(`(symbol, lo, hi) DO NOTHING`)
    .execute();
})

export const getOperationStatus = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { operation } = req.params;
  const key = `operation.status.${operation}`;
  const value = await redisCache.get(key);
  res.json(value);
});
