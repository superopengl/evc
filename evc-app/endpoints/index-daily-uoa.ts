import { UnusualOptionActivityIndex } from './../src/entity/UnusualOptionActivityIndex';
import { UnusualOptionActivityStock } from './../src/entity/UnusualOptionActivityStock';
import { getManager, getRepository } from 'typeorm';
import { start } from './jobStarter';
import _ from 'lodash';
import { grabAllUnusualOptionActivity } from '../src/services/barchartService';
import { UnusualOptionActivityEtfs } from '../src/entity/UnusualOptionActivityEtfs';
import moment = require('moment');
import { randomNumber } from './randomNumber';
import { OptionPutCallHistory } from '../src/entity/OptionPutCallHistory';
import { grabOptionPutCallHistory } from '../src/services/barchartService';
import { sleep } from '../src/utils/sleep';
import { OptionPutCallHistoryInformation } from '../src/entity/views/OptionPutCallHistoryInformation';
import { OptionPutCallStockDefInformation } from '../src/entity/views/OptionPutCallStockDefInformation';
import { OptionPutCallAllDefInformation } from '../src/entity/views/OptionPutCallAllDefInformation';


const INDEX_DEF = [
  {
    symbol: '$SPX',
    alias: 'SPX',
    company: 'S&P 500 Index',
    name: 'INDEX',
  },
  {
    symbol: '$IUXX',
    alias: 'NDX（IUXX）',
    company: 'Nasdaq 100 Index',
    name: 'INDEX',
  },
  {
    symbol: '$DJX',
    alias: 'DJI（DJX）',
    company: 'Dow Jones Industrials Average Index',
    name: 'INDEX',
  },
  {
    symbol: '$VIX',
    alias: 'VIX',
    company: 'CBOE Volatility Index',
    name: 'INDEX',
  }
]

async function upsertDatabase(tableEntity, rawData) {
  if (!rawData?.length) {
    console.log('Skip, no date to update')
    return;
  }
  const entities = rawData.map(x => convertToEntity(x));
  const tradeDate = entities[0].tradeDate;

  await getManager().transaction(async m => {
    await m.delete(tableEntity, { tradeDate });
    await m.createQueryBuilder()
      .insert()
      .into(tableEntity)
      .values(entities)
      .orIgnore()
      .execute();
  });
}

function convertToDate(dateMMDDYY) {
  return moment(dateMMDDYY, 'MM/DD/YY').toDate();
}

function getTradeDateTime(rawValue) {
  let date = null;
  let time = null;
  if (/^[0-9]+\/[0-9]+\/[0-9]+$/.test(rawValue)) {
    // MM/DD/YY format
    date = convertToDate(rawValue);
  } else {
    // HH:mm [ET] time format
    const m = moment(rawValue, 'HH:mm [ET]');
    date = m.toDate();
    time = m.format('HH:mm:ss');
  }

  return {
    date,
    time,
  }
}

function stringToInt(str) {
  return +(str?.replace(/[,%]/g, ''));
}

function convertToEntity(data) {
  const { date } = getTradeDateTime(data.tradeTime);
  return {
    symbol: data.baseSymbol,
    tradeDate: date,
    price: stringToInt(data.baseLastPrice),
    type: data.symbolType,
    strike: stringToInt(data.strikePrice),
    expDate: convertToDate(data.expirationDate),
    dte: stringToInt(data.daysToExpiration),
    bid: stringToInt(data.bidPrice),
    midpoint: stringToInt(data.midpoint),
    ask: stringToInt(data.askPrice),
    last: stringToInt(data.lastPrice),
    volume: stringToInt(data.volume),
    openInt: stringToInt(data.openInterest),
    voloi: stringToInt(data.volumeOpenInterestRatio),
    iv: stringToInt(data.volatility),
  }
}

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

const JOB_NAME = 'daily-uoa';
const list = [
  {
    type: 'stock',
    table: UnusualOptionActivityStock
  },
  {
    type: 'etf',
    table: UnusualOptionActivityEtfs
  },
  {
    type: 'index',
    table: UnusualOptionActivityIndex
  },
];


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
  console.log('Grabing unusual option activities');
  for (const info of list) {
    const { type, table } = info;
    const rawData = await grabAllUnusualOptionActivity(type);
    await upsertDatabase(table, rawData);
  }

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
  }

}, { daemon: false });
