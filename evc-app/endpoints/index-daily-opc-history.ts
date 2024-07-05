import { getManager, getRepository } from 'typeorm';
import { start } from './jobStarter';
import _ from 'lodash';
import moment = require('moment');
import { randomNumber } from './randomNumber';
import { OptionPutCallHistory } from '../src/entity/OptionPutCallHistory';
import { grabOptionPutCallHistory } from '../src/services/barchartService';
import { sleep } from '../src/utils/sleep';
import { OptionPutCallAllDefInformation } from '../src/entity/views/OptionPutCallAllDefInformation';


const JOB_NAME = 'daily-opc-history';

function convertToOptionPutCallEntity(data, symbol): OptionPutCallHistory {
  const entity = new OptionPutCallHistory();
  entity.symbol = symbol;
  entity.date = data.date;
  entity.putCallVol = data.raw.putCallVolumeRatio;
  entity.todayOptionVol = data.raw.totalVolume;
  entity.todayOptionVolDelta = randomNumber(12, 19);
  entity.putCallOIRatio = data.raw.putCallOpenInterestRatio;
  entity.putCallOIRatioDelta = randomNumber(0.0001, 0.0004);
  entity.totalOpenInterest = data.raw.totalOpenInterest;
  entity.totalOpenInterestDelta = randomNumber(12, 19);
  entity.raw = data.raw;

  return entity;
}

async function getDataLimit(symbol) {
  const result = await getRepository(OptionPutCallHistory)
    .createQueryBuilder()
    .where(`symbol = '${symbol}'`)
    .select([
      'EXTRACT(DAY FROM NOW() - MAX("date")) AS value'
    ])
    .execute();

  return result?.[0]?.value ?? 90;
}

start(JOB_NAME, async () => {
  // Grab option history
  console.log('Grabing option history');
  let counter = 0;

  const optionPutCallDef = await getRepository(OptionPutCallAllDefInformation)
    .createQueryBuilder()
    .select(['symbol', '"apiSymbol"'])
    .distinct()
    .execute();

  for (const entity of optionPutCallDef) {
    counter++;

    const { symbol, apiSymbol } = entity;
    const limit = await getDataLimit(symbol);

    if (limit > 0) {
      console.log(`[${counter}/${optionPutCallDef.length}]`.bgBlue.white, `Grabing ${entity.symbol} option hisotry from Barchart (${limit} days) ...`);
      const sleepTime = randomNumber(1000, 5000);
      console.log(`Sleeping for ${sleepTime} ms...`);
      await sleep(sleepTime);

      const dataList = await grabOptionPutCallHistory(apiSymbol, limit);
      const entities = dataList.map(d => convertToOptionPutCallEntity(d, symbol));
      await getManager()
        .createQueryBuilder()
        .insert()
        .into(OptionPutCallHistory)
        .values(entities)
        .orIgnore()
        .execute();

      console.log(`[${counter}/${optionPutCallDef.length}]`.bgGreen.white, `Done for ${entity.symbol}.`);
    } else {
      console.log(`[${counter}/${optionPutCallDef.length}]`.bgBlue.white, `Skip for ${entity.symbol} option hisotry because it has been done`);
    }
  }

}, { daemon: false });
