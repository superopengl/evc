import { getManager, getRepository } from 'typeorm';
import { start } from './jobStarter';
import _ from 'lodash';
import moment = require('moment');
import { randomNumber } from './randomNumber';
import { OptionPutCallHistory } from '../src/entity/OptionPutCallHistory';
import { closeBarchartSession, grabOptionPutCallHistory } from '../src/services/barchartService';
import { sleep } from '../src/utils/sleep';
import { OptionPutCallAllDefInformation } from '../src/entity/views/OptionPutCallAllDefInformation';
import errorToJson from 'error-to-json';

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

const DEFAULT_DATA_LIMIT = 90;

/**
 * Days of history missing per symbol, for every symbol at once.
 *
 * Asking per symbol meant one round trip for each of the ~5.6k definitions.
 * Symbols with no history are absent from the map and fall back to
 * DEFAULT_DATA_LIMIT, which is what the per-symbol query returned for them.
 */
async function getDataLimitBySymbol(): Promise<Map<string, any>> {
  const rows = await getRepository(OptionPutCallHistory)
    .createQueryBuilder()
    .select([
      'symbol',
      'EXTRACT(DAY FROM NOW() - MAX("date")) AS value'
    ])
    .groupBy('symbol')
    .execute();

  return new Map(rows.map(r => [r.symbol, r.value]));
}

start(JOB_NAME, async () => {
  // Grab option history
  console.log('Grabing option history');
  let counter = 0;

  const optionPutCallDef = await getRepository(OptionPutCallAllDefInformation)
    .createQueryBuilder()
    .select(['symbol', '"apiSymbol"', 'type'])
    .execute();

  const dataLimitBySymbol = await getDataLimitBySymbol();

  for (const entity of optionPutCallDef) {
    counter++;

    const { symbol, apiSymbol, type } = entity;
    const limit = dataLimitBySymbol.get(symbol) ?? DEFAULT_DATA_LIMIT;
    const logLabel = `${entity.symbol}${type ? ' of ' + type : ''}`;

    if (limit > 0) {
      console.log(`[${counter}/${optionPutCallDef.length}]`.bgBlue.white, `Grabing ${logLabel} option history from Barchart (${limit} days) ...`);
      const sleepTime = randomNumber(200, 3000);
      console.log(`Sleeping for ${sleepTime} ms...`);
      await sleep(sleepTime);

      try {
        const dataList = await grabOptionPutCallHistory(apiSymbol, limit);
        const entities = dataList.map(d => convertToOptionPutCallEntity(d, symbol));
        await getManager()
          .createQueryBuilder()
          .insert()
          .into(OptionPutCallHistory)
          .values(entities)
          .orIgnore()
          .execute();

        console.log(`[${counter}/${optionPutCallDef.length}]`.bgGreen.white, `Done for ${logLabel}.`);
      } catch (e) {
        console.log(`[${counter}/${optionPutCallDef.length}]`.bgRed.white, `Failed for ${logLabel}.`, errorToJson(e));
      }
    } else {
      console.log(`[${counter}/${optionPutCallDef.length}]`.bgBlue.white, `Skip for ${logLabel} option history because it has been done`);
    }
  }

  await closeBarchartSession();
}, { daemon: false });
