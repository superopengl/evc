import { UnusualOptionActivityIndex } from './../src/entity/UnusualOptionActivityIndex';
import { UnusualOptionActivityStock } from './../src/entity/UnusualOptionActivityStock';
import { getManager } from 'typeorm';
import { start } from './jobStarter';
import _ from 'lodash';
import { grabAllUnusualOptionActivity } from '../src/services/barchartService';
import { UnusualOptionActivityEtfs } from '../src/entity/UnusualOptionActivityEtfs';
import moment = require('moment');

async function upsertDatabase(tableEntity, rawData) {
  if (!rawData?.length) {
    console.log('Skip, no date to update');
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
  };
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
  };
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

start(JOB_NAME, async () => {
  console.log('Grabing unusual option activities');
  for (const info of list) {
    const { type, table } = info;
    const rawData = await grabAllUnusualOptionActivity(type);
    await upsertDatabase(table, rawData);
  }
}, { daemon: false });
