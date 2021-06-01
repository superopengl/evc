import { getManager, getRepository } from 'typeorm';
import { start } from './jobStarter';
import { Stock } from '../src/entity/Stock';
import { singleBatchRequest } from '../src/services/iexService';
import * as _ from 'lodash';
import { StockInsiderTransaction } from '../src/entity/StockInsiderTransaction';
import { handleInsiderTransactionWatchlistNotification } from './handleInsiderTransactionWatchlistNotification';


async function syncManyStockInsiderTransactions(list: StockInsiderTransaction[]) {
  const entites = list.filter(x => x?.value);

  await getManager()
    .createQueryBuilder()
    .insert()
    .into(StockInsiderTransaction)
    .values(entites)
    .onConflict('(symbol) DO UPDATE SET value = excluded.value')
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
    const insiderTransactionData = value['insider-transactions'];
    const entity = new StockInsiderTransaction();
    entity.symbol = symbol;
    entity.value = insiderTransactionData
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
      ]))
    entities.push(entity);
  }

  await syncManyStockInsiderTransactions(entities);
}


async function syncIexForSymbols(symbols: string[]) {
  const types = ['insider-transactions'];
  const resp = await singleBatchRequest(symbols, types);
  await udpateDatabase(resp);
}

const JOB_NAME = 'feed-insiderTransactions';

start(JOB_NAME, async () => {

  const stocks = await getRepository(Stock)
    .createQueryBuilder()
    .select('symbol')
    .getRawMany();
  const symbols = stocks.map(s => s.symbol);

  const batchSize = 100;
  let round = 0;
  const chunks = _.chunk(symbols, batchSize);
  for (const batchSymbols of chunks) {
    console.log(JOB_NAME, `${++round}/${chunks.length}`);
    await syncIexForSymbols(batchSymbols);
  }

  await handleInsiderTransactionWatchlistNotification();

  // await executeWithDataEvents('refresh materialized views', JOB_NAME, () => refreshMaterializedView(StockPutCallRatio90));
});
