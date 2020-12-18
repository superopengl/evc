import React from 'react';
import PropTypes from 'prop-types';
import { List, Typography, Space, Image, Tooltip, Modal, Tabs } from 'antd';
import { withRouter } from 'react-router-dom';
import { DeleteOutlined, EyeOutlined, EyeInvisibleOutlined, LockFilled } from '@ant-design/icons';
import StockInfoCard from './StockInfoCard';
import { StockName } from './StockName';
import { FaCrown } from 'react-icons/fa';
import { IconContext } from "react-icons";
import { getStockQuote } from 'services/stockService';
import { TimeAgo } from 'components/TimeAgo';
import { Loading } from './Loading';
import { GlobalContext } from 'contexts/GlobalContext';
import { filter } from 'rxjs/operators';
import * as moment from 'moment-timezone';

const { Paragraph, Text, Title } = Typography;


const StockQuotePanel = (props) => {

  const { symbol } = props;
  const [previousPrice, setPreviousPrice] = React.useState();
  const [currentPrice, setCurrentPrice] = React.useState();
  const [updateTime, setUpdateTime] = React.useState();
  const [quote, setQuote] = React.useState({});
  const [priceEvent, setPriceEvent] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const context = React.useContext(GlobalContext);

  const loadData = async () => {
    try {
      setLoading(true);
      const quote = await getStockQuote(symbol) ?? {};
      setQuote(quote);
      setCurrentPrice(quote.latestPrice);
      setPreviousPrice(quote.latestPrice - quote.change);
      setUpdateTime(quote.latestUpdate);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (priceEvent) {
      const { price, time } = priceEvent;
      setPreviousPrice(currentPrice);
      setCurrentPrice(price);
      setUpdateTime(time);
    }
  }, [priceEvent]);

  const subscribePriceEvent = () => {
    const subscription = context.event$.pipe(
      filter(e => e.type === 'price'),
      filter(e => e.data?.symbol === symbol)
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

  const getTrendComponent = (base, target) => {
    if (base === target) {
      return <Text type="secondary">0 (0%)</Text>
    }
    const symbol = target >= base ? '+' : '-';
    const type = target >= base ? 'success' : 'danger';
    const diffNumber = Math.abs(target - base);
    const diffPercentage = (diffNumber / target * 100).toFixed(2);
    return <Text type={type}><small>{symbol}{diffNumber.toFixed(2)} ({symbol}{diffPercentage}%)</small></Text>
  }

  if (loading) {
    return <Loading />
  }

  return (
    <Space size="large" style={{ alignItems: 'flex-end' }}>
      <div>
        <Text style={{ fontSize: 30 }} strong>{currentPrice} {getTrendComponent(previousPrice, currentPrice)}</Text>
        <div><Text type="secondary"><small>Price At: {moment(updateTime).format('h:mm a')} EST</small></Text></div>
      </div>
      <div>
          <Text style={{ fontSize: 20 }} strong>{quote.open} {getTrendComponent(quote.open, currentPrice)}</Text>
          <div><Text type="secondary"><small>pre market</small></Text></div>
        </div>
        <div>
          <Text style={{ fontSize: 20 }} strong>{quote.close} {getTrendComponent(quote.close, currentPrice)}</Text>
          <div><Text type="secondary"><small>post market</small></Text></div>
        </div>
    </Space>
  );
};

StockQuotePanel.propTypes = {
  symbol: PropTypes.string.isRequired
};

StockQuotePanel.defaultProps = {
};

export default withRouter(StockQuotePanel);
