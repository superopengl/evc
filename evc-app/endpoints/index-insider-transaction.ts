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

async function udpateDatabase(iexBatchResponse) {
  const entities: StockInsiderTransaction[] = [];
  for (const [symbol, value] of Object.entries(iexBatchResponse)) {
    // advanced-stats
    const insiderTransactionData = value as [any];
    const list = insiderTransactionData
      .filter(x => includesTransactionCode(x.transactionCode))
      .map(x => _.pick(x, [
        'fullName',
        'reportedTitle',
        'conversionOrExercisePrice',
        'filingDate',
        'postShares',
        'transactionCode',
        'transactionDate',
        'transactionPrice',
        'transactionShares',
        'transactionValue',
      ]));
    const sortedList = _.orderBy(list, ['filingDate', 'transactionDate', 'fullName'], ['desc', 'desc', 'asc']);
    const first = sortedList[0];
    const entity = new StockInsiderTransaction();
    entity.symbol = symbol;
    entity.value = sortedList;
    entity.first = first;
    entity.firstHash = objHash(first || {});
    entities.push(entity);
  }

  await syncManyStockInsiderTransactions(entities);
}


async function syncIexForSymbols(symbols: string[]) {
  throw Error('Not implemented. Need to find a data provider for insider transations')
  // const resp = await sendIexRequest(symbols, 'insider_transactions', { last: 30 });
  // const map = _.groupBy(resp, x => x.symbol);
  // await udpateDatabase(map);
}

const JOB_NAME = 'feed-insiderTransactions';

start(JOB_NAME, async () => {

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
    await syncIexForSymbols(batchSymbols);
  }

  await handleWatchlistInsiderTransactionNotification();

  // await executeWithDataEvents('refresh materialized views', JOB_NAME, () => refreshMaterializedView(StockPutCallRatio90));
});
