import { getRepository, getManager } from 'typeorm';
import { assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { StockPublish } from '../entity/StockPublish';


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

  await getManager()
    .query(
      `insert into stock_publish (symbol, author, "supportId", "resistanceId", "valueId") values ($1, $2, $3, $4, $5)`,
      [symbol, userId, supportId, resistanceId, valueId]
    );

  res.json();
});
