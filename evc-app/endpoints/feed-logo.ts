import { getRepository, IsNull } from 'typeorm';
import { start } from './jobStarter';
import { Stock } from '../src/entity/Stock';
import { getStockLogoUrl } from '../src/utils/getStockLogoUrl';
import errorToJson from 'error-to-json';

const JOB_NAME = 'feed-logo';

start(JOB_NAME, async () => {
  const stocks = await getRepository(Stock).find({
    where: {
      logoUrl: IsNull()
    },
    order: {
      symbol: 'ASC'
    }
  });
  const errors = [];
  let count = 0;
  for (const stock of stocks) {
    try {
      const logoUrl = getStockLogoUrl(stock.symbol);
      if (logoUrl) {
        stock.logoUrl = logoUrl;
        await getRepository(Stock).save(stock);
      }
    } catch (err) {
      errors.push(`${stock.symbol} failed. ${errorToJson(err)}`)
    }
    console.log(`Done [${++count}/${stocks.length}]`);
  }

  for (const err of errors) {
    console.error(err);
  }

}, { syncSchema: false });
