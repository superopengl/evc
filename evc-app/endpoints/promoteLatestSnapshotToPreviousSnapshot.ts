import { getRepository, getManager } from 'typeorm';
import { StockInsiderTransaction } from '../src/entity/StockInsiderTransaction';
import { StockInsiderTransactionPreviousSnapshot } from '../src/entity/StockInsiderTransactionPreviousSnapshot';


export async function promoteLatestSnapshotToPreviousSnapshot() {
  const { tableName: curTableName, schema: curSchema } = getRepository(StockInsiderTransaction).metadata;
  const { tableName: preTableName, schema: preSchema } = getRepository(StockInsiderTransactionPreviousSnapshot).metadata;

  await getManager().transaction(async (m) => {
    await m.delete(StockInsiderTransactionPreviousSnapshot, {});
    const sqlPromote = `INSERT INTO "${preSchema}"."${preTableName}" SELECT * FROM "${curSchema}"."${curTableName}"`;
    await m.query(sqlPromote);
  });
}
