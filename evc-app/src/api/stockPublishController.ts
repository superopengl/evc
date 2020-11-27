import { getRepository, getManager } from 'typeorm';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { StockPublish } from '../entity/StockPublish';
import { StockSupportShort } from '../entity/StockSupportShort';
import { StockResistanceShort } from '../entity/StockResistanceShort';
import { StockValue } from '../entity/StockValue';
import { v4 as uuidv4 } from 'uuid';

export const listStockPublish = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const limit = +req.query.limit || 6;

  const list = await getRepository(StockPublish)
    .createQueryBuilder('sp')
    .where({ symbol })
    .leftJoinAndMapOne('sp.support', StockSupportShort, 'ss', 'ss.id = sp."supportId"')
    .leftJoinAndMapOne('sp.resistance', StockResistanceShort, 'sr', 'sr.id = sp."resistanceId"')
    .leftJoinAndMapOne('sp.value', StockValue, 'sv', 'sv.id = sp."valueId"')
    .orderBy('sp."createdAt"', 'DESC')
    .limit(limit)
    .getMany();

  res.json(list);
});

export const saveStockPublish = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const { user: { id: userId } } = req as any;

  const { supportId, resistanceId, valueId } = req.body;
  assert(supportId, 400, 'supportId is not specified');
  assert(resistanceId, 400, 'resistanceId is not specified');
  assert(valueId, 400, 'valueId is not specified');

  // await getManager()
  //   .query(
  //     `insert into stock_publish (symbol, author, "supportId", "resistanceId", "valueId") values ($1, $2, $3, $4, $5)`,
  //     [symbol, userId, supportId, resistanceId, valueId]
  //   );

  await getManager().transaction(async tranc => {
    const publish = new StockPublish();
    publish.id = uuidv4();
    publish.symbol = symbol;
    publish.author = userId;
    publish.supportId = supportId;
    publish.resistanceId = resistanceId;
    publish.valueId = valueId;

    await tranc.getRepository(StockPublish).insert(publish);
  });

  res.json();
});
