import { getManager, getRepository } from 'typeorm';
import { start } from './jobStarter';
import { Stock } from '../src/entity/Stock';
import _ from 'lodash';
import { StockInsiderTransaction } from '../src/entity/StockInsiderTransaction';
import { handleWatchlistInsiderTransactionNotification } from './handleWatchlistInsiderTransactionNotification';
import objHash from 'object-hash';
import { promoteLatestSnapshotToPreviousSnapshot } from './promoteLatestSnapshotToPreviousSnapshot';

async function syncManyStockInsiderTransactions(list: StockInsiderTransaction[]) {
  const entites = list.filter(x => x?.value);

  await getManager()
    .createQueryBuilder()
    .insert()
    .into(StockInsiderTransaction)
    .values(entites)
    .onConflict(`(symbol) DO UPDATE SET 
    value = excluded.value, 
    first = excluded.first, 
    "firstHash" = excluded."firstHash", 
    "createdAt" = NOW()`)
    .execute();
}

function includesTransactionCode(transactionCode: string) {
  switch (transactionCode) {
    case 'A':
    case 'P':
    case 'S':
    case 'M':
    case 'G':
      return true;
    default:
      return false;
  }
}

async function syncForSymbols(symbols: string[]) {
  throw Error('Not implemented. Need to find a data provider for insider transations')
  // const resp = await sendIexRequest(symbols, 'insider_transactions', { last: 30 });
  // const map = _.groupBy(resp, x => x.symbol);
  // await udpateDatabase(map);
}

const JOB_NAME = 'feed-insiderTransactions';

start(JOB_NAME, async () => {

  console.log('Skip insider transactions fetching');
  return;

  const stocks = await getRepository(Stock)
    .createQueryBuilder()
    .select('symbol')
    .getRawMany();
  const symbols = stocks.map(s => s.symbol);

  if (symbols.length) {
    await promoteLatestSnapshotToPreviousSnapshot();
  }

  const batchSize = 100;
  let round = 0;
  const chunks = _.chunk(symbols, batchSize);
  for (const batchSymbols of chunks) {
    console.log(JOB_NAME, `${++round}/${chunks.length}`);
    await syncForSymbols(batchSymbols);
  }

  await handleWatchlistInsiderTransactionNotification();
});
