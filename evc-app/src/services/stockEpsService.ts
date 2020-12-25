import { getManager } from "typeorm";
import { executeSqlStatement } from "../../endpoints/executeSqlStatement";
import { StockEps } from "../entity/StockEps";
import { getEarnings } from "./iexService";

export type StockIexEpsInfo = {
  symbol: string,
  fiscalPeriod: string,
  value: number,
}

export const syncStockEps = async (symbol: string) => {
  const earnings = await getEarnings(symbol, 4);
  const infoList = earnings.map(e => {
    const data: StockIexEpsInfo = {
      symbol,
      fiscalPeriod: e.fiscalPeriod,
      value: e.actualEPS,
    };

    return data;
  });

  await syncManyStockEps(infoList);
}

export const syncManyStockEps = async (epsInfo: StockIexEpsInfo[]) => {
  await executeSqlStatement(epsInfo, item => {
    const { symbol, fiscalPeriod, value } = item;
    const matches = /Q([1-4]) ([0-9]{4})/.exec(fiscalPeriod);
    if (!matches) return null;

    const [full, quarter, year] = matches;

    return `INSERT INTO public.stock_eps(symbol, "createdAt", year, quarter, value) VALUES ('${symbol}', timezone('UTC', now()), ${year}, '${quarter}', '${value}') ON CONFLICT (symbol, year, quarter) DO UPDATE SET value = excluded.value, "createdAt" = excluded."createdAt"`;
  });
}