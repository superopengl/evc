
import { getManager, getRepository } from 'typeorm';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { RevenueChartInformation } from '../entity/views/RevenueChartInformation';

export const getRevenueChart = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const period = req.query.period as string || 'week';

  assert(['year', 'month', 'week', 'day'].includes(period), 400, `Unsupported period ${period}`);

  const query = getRepository(RevenueChartInformation)
    .createQueryBuilder()
    .groupBy(period)
    .orderBy(period, 'ASC')
    .select([
      'sum(price) as revenue',
      'sum(payable) as profit',
      'sum(deduction) as credit',
      `${period} as time`
    ]);

  const result = await query.execute();

  res.json(result);
});
