import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Space, Card } from 'antd';
import { withRouter } from 'react-router-dom';
import { getStockQuote } from 'services/stockService';
import { TimeAgo } from 'components/TimeAgo';
import { GlobalContext } from 'contexts/GlobalContext';
import { filter, debounceTime } from 'rxjs/operators';
import * as moment from 'moment-timezone';
import ReactDOM from "react-dom";
import isNil from 'lodash/isNil';
import { Skeleton } from 'antd';
import { from } from 'rxjs';
import { useMediaQuery } from 'react-responsive'

const { Text } = Typography;


const StockQuotePanel = (props) => {

  const { symbol } = props;
  const [quote, setQuote] = React.useState({});
  const [priceEvent, setPriceEvent] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const context = React.useContext(GlobalContext);

  const loadData = async () => {
    try {
      setLoading(true);
      const quote = await getStockQuote(symbol) ?? {};
      ReactDOM.unstable_batchedUpdates(() => {
        setQuote(quote);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (priceEvent) {
      const { price, time } = priceEvent;
      const oldPirce = quote.latestPrice;
      if (price !== oldPirce) {
        setQuote({
          ...quote,
          latestPrice: price,
          change: price - oldPirce,
          changePercent: (price - oldPirce) / oldPirce,
          latestUpdate: time,
        })
      }
    }
  }, [priceEvent]);

  const subscribePriceEvent = () => {
    const subscription = context.event$
      .pipe(
        filter(e => e.type === 'price'),
        filter(e => e.data?.symbol === symbol),
        // debounceTime(1000),
      ).subscribe(e => {
        setPriceEvent(e.data);
      });
    return subscription;
  }

  React.useEffect(() => {
    const load$ = from(loadData()).subscribe();
    const event$ = subscribePriceEvent();
    return () => {
      load$.unsubscribe();
      event$.unsubscribe();
    }
  }, []);

  const getDeltaComponent = (changeValue, changePrecent) => {
    if (isNil(changeValue) || isNil(changePrecent)) {
      return null;
    }
    if (changeValue === 0) {
      return <Text type="secondary">0 (0%)</Text>
    }
    const symbol = changeValue >= 0 ? '+' : '';
    const type = changeValue >= 0 ? 'success' : 'danger';
    return <Text type={type}><small>{symbol}{changeValue.toFixed(3)} ({symbol}{changePrecent?.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 3 })})</small></Text>
  }

  const isIntra = quote.isUSMarketOpen;

  const superNarrow = useMediaQuery({ query: '(max-width: 465px)' });

  return (
    <Card
      size="middle"
      title={null}
      bodyStyle={{ minHeight: 178 }}
    // style={{height: 178}}
    >
      {loading ?
        <Skeleton active />
        :
        <Space size="small" direction="vertical">
          <div>
            <Text style={{ fontSize: 30 }} strong>{quote.latestPrice?.toFixed(2)} {getDeltaComponent(quote.change, quote.changePercent)}</Text>
            <div><Text type="secondary"><small>Price At: {moment(quote.latestUpdate).format('D MMM YYYY')} EST</small></Text></div>
          </div>
          {!isIntra && quote.extendedPrice && <div>
            <Text style={{ fontSize: 20 }} strong>{quote.extendedPrice?.toFixed(2)} {getDeltaComponent(quote.extendedChange, quote.extendedChangePercent)}</Text>
            <div>
              <Space size="small" style={{ width: '100%', alignItems: 'flex-start' }}>
                <Text type="secondary"><small>extended hours</small></Text>
                <TimeAgo direction={superNarrow ? 'vertical' : 'horizontal'} value={quote.extendedPriceTime} />
              </Space>
            </div>
          </div>}
        </Space>}
    </Card>
  );
};

StockQuotePanel.propTypes = {
  symbol: PropTypes.string.isRequired
};

StockQuotePanel.defaultProps = {
};

export default withRouter(StockQuotePanel);
