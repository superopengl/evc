import { UnusualOptionActivityIndex } from '../src/entity/UnusualOptionActivityIndex';
import { UnusualOptionActivityStock } from '../src/entity/UnusualOptionActivityStock';
import { getManager } from 'typeorm';
import { start } from './jobStarter';
import _ from 'lodash';
import { grabOptionPutCallHistory } from '../src/services/barchartService';
import { UnusualOptionActivityEtfs } from '../src/entity/UnusualOptionActivityEtfs';
import OPTION_PUT_CALL_DEF from './option-put-call-def.json';
import moment = require('moment');
import { OptionPutCall } from '../src/entity/OptionPutCall';

async function upsertDatabase(tableEntity, rawData) {
  if (!rawData?.length) {
    console.log('Skip, no date to update')
    return;
  }
  const entities = rawData.map(x => convertToEntity(x));
  const tradeDate = entities[0].tradeDate;

  await getManager().transaction(async m => {
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


const JOB_NAME = 'daily-opc';

const TARGET_TABLE_MAP = new Map([
  ['index', UnusualOptionActivityStock],
  ['etfs', UnusualOptionActivityStock],
  ['nasdaq', UnusualOptionActivityStock],
]);

type DEF_INFO = {
  type: 'index' | 'etfs' | 'nasdaq';
  symbol: string;
  name: string;
  url: string;
}

function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function convertToOptionPutCallEntity(data, info: DEF_INFO): OptionPutCall {
  const entity = new OptionPutCall();
  entity.symbol = info.symbol;
  entity.date = data.date;
  entity.name = info.name;
  entity.type = info.type;
  entity.putCallVolumeRatio = data.raw.putCallVolumeRatio;
  entity.totalVolume = data.raw.totalVolume + randomNumber(12, 19);
  entity.putCallOpenInterestRatio = data.raw.putCallOpenInterestRatio + randomNumber(0.0001, 0.0004);
  entity.totalOpenInterest = data.raw.totalOpenInterest + randomNumber(12, 19);
  entity.raw = data.raw;

  return entity;
}

start(JOB_NAME, async () => {
  let counter = 0;
  for (const info of OPTION_PUT_CALL_DEF as any as DEF_INFO[]) {
    console.log(`[${++counter}/${OPTION_PUT_CALL_DEF.length}]`.bgBlue.white, `Grabing ${info.symbol} option hisotry from Barchart ...`);

    const dataList = await grabOptionPutCallHistory(info.symbol, 1);
    const entities = dataList.map(d => convertToOptionPutCallEntity(d, info));
    await getManager()
      .createQueryBuilder()
      .insert()
      .into(OptionPutCall)
      .values(entities)
      .orIgnore()
      .execute();

    console.log(`[${++counter}/${OPTION_PUT_CALL_DEF.length}]`.bgGreen.white, `Done for ${info.symbol}.`);
  }
}, { daemon: false });
