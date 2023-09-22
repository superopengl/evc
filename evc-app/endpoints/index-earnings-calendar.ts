import { getRepository, getManager } from 'typeorm';
import { start } from './jobStarter';
import { getEarningsCalendarForAll } from '../src/services/alphaVantageService';
import { StockEarningsCalendar } from '../src/entity/StockEarningsCalendar';
import * as _ from 'lodash';

const JOB_NAME = 'daily-earnings-calendar';

start(JOB_NAME, async () => {
  const list = await getEarningsCalendarForAll();

  if (!list.length) {
    return;
  }

  const chunks = _.chain(list)
    .map(x => {
      const entity = new StockEarningsCalendar();
      entity.symbol = x.symbol;
      entity.reportDate = x.reportDate;
      return entity;
    })
    .chunk(1000)
    .value();

  // Delete all
  await getRepository(StockEarningsCalendar).delete({});

  for (const values of chunks) {
    await getManager()
      .createQueryBuilder()
      .insert()
      .into(StockEarningsCalendar)
      .values(values)
      .orIgnore()
      .execute();
  }
}, { syncSchema: false });
