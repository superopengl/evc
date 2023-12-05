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
import OPTION_PUT_CALL_DEF from './option-put-call-def.json';
import { grabOptionPutCallHistory } from '../src/services/barchartService';
import { sleep } from '../src/utils/sleep';

const defList = OPTION_PUT_CALL_DEF as any as DEF_INFO[];

type DEF_INFO = {
  type: 'index' | 'etfs' | 'nasdaq';
  symbol: string;
  name: string;
  url: string;
}

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

function convertToOptionPutCallEntity(data, info: DEF_INFO): OptionPutCallHistory {
  const entity = new OptionPutCallHistory();
  entity.symbol = info.symbol;
  entity.date = data.date;
  entity.name = info.name;
  entity.type = info.type;
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
  const result = await getRepository(OptionPutCallHistory).findOne({ symbol });
  return result ? 1 : 90;
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
  for (const info of defList) {
    counter++;
    const limit = await getDataLimit(info.symbol);

    console.log(`[${counter}/${defList.length}]`.bgBlue.white, `Grabing ${info.symbol} option hisotry from Barchart (${limit} days) ...`);
    const sleepTime = randomNumber(1000, 5000);
    console.log(`Sleeping for ${sleepTime} ms...`);
    await sleep(sleepTime);

    const dataList = await grabOptionPutCallHistory(info.symbol, limit);
    const entities = dataList.map(d => convertToOptionPutCallEntity(d, info));
    await getManager()
      .createQueryBuilder()
      .insert()
      .into(OptionPutCallHistory)
      .values(entities)
      .orIgnore()
      .execute();

    console.log(`[${counter}/${defList.length}]`.bgGreen.white, `Done for ${info.symbol}.`);
  }



}, { daemon: false });
