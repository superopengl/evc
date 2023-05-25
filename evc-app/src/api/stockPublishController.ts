import { getRepository, getManager } from 'typeorm';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { StockPublish } from '../entity/StockPublish';
import { StockSupport } from '../entity/StockSupport';
import { StockResistance } from '../entity/StockResistance';
import { StockValue } from '../entity/StockValue';
import { v4 as uuidv4 } from 'uuid';

export const listStockPublish = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { symbol } = req.params;
  const limit = +req.query.limit || 6;

  const list = await getRepository(StockPublish).find({
    where: {
      symbol
    },
    order: {
      createdAt: 'DESC',
    },
    relations: [
      'support',
      'resistance',
      'value'
    ],
    take: limit
  });

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
    const [support, resistance, value] = await Promise.all([
      tranc.getRepository(StockSupport).findOne(supportId),
      tranc.getRepository(StockResistance).findOne(resistanceId),
      tranc.getRepository(StockValue).findOne(valueId),
    ]);

    const publish = new StockPublish();
    publish.id = uuidv4();
    publish.symbol = symbol;
    publish.author = userId;
    publish.support = support;
    publish.resistance = resistance;
    publish.value = value;

    await tranc.save(publish);

    support.publish = publish;
    resistance.publish = publish;
    value.publish = publish;

    await tranc.save(support);
    await tranc.save(resistance);
    await tranc.save(value);
  });

  res.json();
});
