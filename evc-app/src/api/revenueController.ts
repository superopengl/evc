
import { getRepository } from 'typeorm';
import { assert } from '../utils/assert';
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import { json2csvAsync } from 'json-2-csv';
import { ReceiptInformation } from '../entity/views/ReceiptInformation';
import { RevenueUsdChartInformation } from '../entity/views/RevenueUsdChartInformation';
import { RevenueCnyChartInformation } from '../entity/views/RevenueCnyChartInformation';

export const getRevenueChart = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const period = req.query.period as string || 'week';

  assert(['year', 'month', 'week', 'day'].includes(period), 400, `Unsupported period ${period}`);

  const conbimedUsdQuery = getRepository(RevenueUsdChartInformation)
    .createQueryBuilder()
    .groupBy(period)
    .orderBy(period, 'ASC')
    .select([
      'sum(price) as revenue',
      'sum(payable) as profit',
      'sum(deduction) as credit',
      `${period} as time`
    ]);

  const queryNzUsdOnly = getRepository(RevenueUsdChartInformation)
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

  const queryNonNzUsd = getRepository(RevenueUsdChartInformation)
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

  const conbimedCnyQuery = getRepository(RevenueCnyChartInformation)
    .createQueryBuilder()
    .groupBy(period)
    .orderBy(period, 'ASC')
    .select([
      'sum(price) as revenue',
      'sum(payable) as profit',
      'sum(deduction) as credit',
      `${period} as time`
    ]);

  const queryNzCnyOnly = getRepository(RevenueCnyChartInformation)
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

  const queryNonNzCny = getRepository(RevenueCnyChartInformation)
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
    combinedUsd: await conbimedUsdQuery.execute(),
    NzUsd: await queryNzUsdOnly.execute(),
    nonNzUsd: await queryNonNzUsd.execute(),
    combinedCny: await conbimedCnyQuery.execute(),
    NzCny: await queryNzCnyOnly.execute(),
    nonNzCny: await queryNonNzCny.execute(),
  }

  res.json(result);
});


export const downloadAllPaymentCsv = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');

  const result = await getRepository(ReceiptInformation).find({})

  const csv = await json2csvAsync(result, { emptyFieldValue: '', useLocaleFormat: true });

  res.send(csv);
});
