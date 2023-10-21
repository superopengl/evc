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
import {isNil} from 'lodash';
import { Skeleton } from 'antd';

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
    const subscription = context.event$.pipe(
      filter(e => e.type === 'price'),
      filter(e => e.data?.symbol === symbol),
      debounceTime(1000),
    ).subscribe(e => {
      setPriceEvent(e.data);
    });
    return subscription;
  }

  React.useEffect(() => {
    loadData();
    const subscription = subscribePriceEvent();
    return () => {
      subscription.unsubscribe();
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
    return <Text type={type}><small>{symbol}{changeValue} ({symbol}{changePrecent?.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 3 })})</small></Text>
  }

  const isIntra = quote.isUSMarketOpen;

  return (
    <Card
      size="middle"
      title={null}
      // bodyStyle={{height: 178}}
      style={{height: '100%'}}
      >
      {loading ?
        <Skeleton active />
        :
        <Space size="small" direction="vertical">
          <div>
            <Text style={{ fontSize: 30 }} strong>{quote.latestPrice} {getDeltaComponent(quote.change, quote.changePercent)}</Text>
            <div><Text type="secondary"><small>Price At: {moment(quote.latestUpdate).format('h:mm a')} EST</small></Text></div>
          </div>
          {!isIntra && quote.extendedPrice && <div>
            <Text style={{ fontSize: 20 }} strong>{quote.extendedPrice} {getDeltaComponent(quote.extendedChange, quote.extendedChangePercent)}</Text>
            <div>
              <Space size="small">
                <Text type="secondary"><small>extended hours</small></Text>
                <TimeAgo direction="horizontal" value={quote.extendedPriceTime} />
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
