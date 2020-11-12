
import { getManager, getRepository, Like } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Stock } from '../entity/Stock';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';
import { guessDisplayNameFromFields } from '../utils/guessDisplayNameFromFields';
import { StockHistory } from '../entity/StockHistory';
import * as moment from 'moment';

async function publishStock(stock) {

}

export const getStock = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { user: { id: userId } } = req as any;
  const symbol = req.params;

  const repo = getRepository(Stock);
  const stock = await repo.findOne(symbol);
  assert(stock, 404);

  res.json(stock);
});

export const getStockHistory = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { user: { id: userId, role } } = req as any;
  const {symbol} = req.params;

  const list = await getRepository(StockHistory).find({
    where: {
      symbol
    },
    order: {
      createdAt: 'DESC'
    }
  });
  assert(list.length, 404);

  res.json(list);
});

export const listStock = handlerWrapper(async (req, res) => {
  const list = await getRepository(Stock).find({select: ['symbol', 'company']});

  res.json(list);
});

export const searchStock = handlerWrapper(async (req, res) => {
  // assertRole(req, 'admin', 'agent', 'client');
  const { text, history, from, to, page, size } = req.body;

  assert(page >= 0 && size > 0, 400, 'Invalid page and size parameter');
  const pagenation = {
    skip: page * size,
    limit: size,
  };

  let query = getManager()
    .createQueryBuilder()
    .from(history ? StockHistory : Stock, 's')
    .where('1 = 1');
  if (text) {
    query = query.andWhere('s.symbol ILIKE :text OR s.company ILIKE :text', { text: `%${text}%` });
  }
  if (from) {
    query = query.andWhere('s."createdAt" >= :date', { data: moment(from).toDate() });
  }
  if (to) {
    query = query.andWhere('s."createdAt" <= :date', { data: moment(to).toDate() });
  }
  query = query.orderBy('symbol')
  .addOrderBy('"createdAt"', 'DESC')
  .offset(pagenation.skip)
  .limit(pagenation.limit);

  const list = await query.execute();
  res.json(list);
});

export const saveStock = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { user: { id: userId } } = req as any;
  const stock = new Stock();


  Object.assign(stock, req.body);
  stock.symbol = stock.symbol.toUpperCase();
  stock.by = userId;

  const repo = getRepository(Stock);
  await repo.save(stock);

  if (stock.shouldPublish) {
    await publishStock(stock);
  }

  res.json();
});

export const deleteStock = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { symbol } = req.params;
  const repo = getRepository(Stock);
  await repo.delete(symbol);
  res.json();
});