import { UnusualOptionActivityIndex } from '../src/entity/UnusualOptionActivityIndex';
import { UnusualOptionActivityStock } from '../src/entity/UnusualOptionActivityStock';
import { getManager } from 'typeorm';
import { start } from './jobStarter';
import _ from 'lodash';
import { getOptionPutCallHistory as fetchOptionPutCallHistory } from '../src/services/barchartService';
import { UnusualOptionActivityEtfs } from '../src/entity/UnusualOptionActivityEtfs';
import OPTION_PUT_CALL_DEF from './option-put-call-def.json';
import moment = require('moment');

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
  symbol: String;
  name: String;
  url: String;
}

start(JOB_NAME, async () => {
  for (const info of OPTION_PUT_CALL_DEF as any as DEF_INFO[]) {
    const targetTable = TARGET_TABLE_MAP.get(info.type);
    if (!targetTable) {
      throw Error(`Table of type '${info.type}' is unsupported.`);
    }
    const rawData = await fetchOptionPutCallHistory(info.symbol, 1);
    // await upsertDatabase(targetTable, rawData);
  }
}, { daemon: false });
