import { httpGet, request } from './http';

export async function getRevenueChartData(period) {
  return httpGet(`revenue`, { period });
}

export async function downloadAllPaymentCsv() {
  return request('GET', `revenue/payment/csv`, null, null, 'blob')
}
