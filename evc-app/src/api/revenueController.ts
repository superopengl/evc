
import { getManager, getRepository } from 'typeorm';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { RevenueChartInformation } from '../entity/views/RevenueChartInformation';
import { json2csvAsync } from 'json-2-csv';
import { ReceiptInformation } from '../entity/views/ReceiptInformation';

export const getRevenueChart = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const period = req.query.period as string || 'week';

  assert(['year', 'month', 'week', 'day'].includes(period), 400, `Unsupported period ${period}`);

  const conbimedQuery = getRepository(RevenueChartInformation)
    .createQueryBuilder()
    .groupBy(period)
    .orderBy(period, 'ASC')
    .select([
      'sum(price) as revenue',
      'sum(payable) as profit',
      'sum(deduction) as credit',
      `${period} as time`
    ]);

  const queryNZOnly = getRepository(RevenueChartInformation)
    .createQueryBuilder()
    .where(`"isNZ" is true`)
    .groupBy(period)
    .orderBy(period, 'ASC')
    .select([
      'sum(price) as revenue',
      'sum(payable) as profit',
      'sum(deduction) as credit',
      `${period} as time`
    ]);

  const queryNonNZ = getRepository(RevenueChartInformation)
    .createQueryBuilder()
    .where(`"isNZ" is false`)
    .groupBy(period)
    .orderBy(period, 'ASC')
    .select([
      'sum(price) as revenue',
      'sum(payable) as profit',
      'sum(deduction) as credit',
      `${period} as time`
    ]);

  const result = {
    combined: await conbimedQuery.execute(),
    NZ: await queryNZOnly.execute(),
    nonNZ: await queryNonNZ.execute(),
  }

  res.json(result);
});


export const downloadAllPaymentCsv = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');

  const result = await getRepository(ReceiptInformation).find({})

  const csv = await json2csvAsync(result, { emptyFieldValue: '', useLocaleFormat: true });

  res.send(csv);
});
