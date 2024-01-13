import { getRepository, getManager, Raw } from 'typeorm';
import { StockInsiderTransaction } from '../src/entity/StockInsiderTransaction';
import { StockInsiderTransactionPreviousSnapshot } from '../src/entity/StockInsiderTransactionPreviousSnapshot';


export async function promoteLatestSnapshotToPreviousSnapshot() {
  const { tableName: curTableName, schema: curSchema } = getRepository(StockInsiderTransaction).metadata;
  const { tableName: preTableName, schema: preSchema } = getRepository(StockInsiderTransactionPreviousSnapshot).metadata;

  await getManager().transaction(async (m) => {
    await m.query(`DELETE FROM "${preSchema}"."${preTableName}" WHERE "discardedAt" + interval '7' day > now() AND "discardedAt" IS NOT NULL`);
    await m.query(`UPDATE "${preSchema}"."${preTableName}" SET "discardedAt" = now() WHERE "discardedAt" IS NULL`);
    const sqlPromote = `INSERT INTO "${preSchema}"."${preTableName}" (symbol, value, "createdAt", first, "firstHash") SELECT symbol, value, "createdAt", first, "firstHash" FROM "${curSchema}"."${curTableName}"`;
    await m.query(sqlPromote);
  });
}
