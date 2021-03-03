import { Space, Row, Col, Card, PageHeader, Tag } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { Loading } from 'components/Loading';
import { GlobalContext } from 'contexts/GlobalContext';
import { getStock, unwatchStock, watchStock } from 'services/stockService';
import { StockName } from 'components/StockName';
import StockNewsPanel from 'components/StockNewsPanel';
import StockChart from 'components/charts/StockChart';
import StockQuotePanel from 'components/StockQuotePanel';
import { StockWatchButton } from 'components/StockWatchButton';
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

const StockFreePage = (props) => {
  const { symbol } = props;

  const context = React.useContext(GlobalContext);
  const { role } = context;
  const [stock, setStock] = React.useState();
  const [watched, setWatched] = React.useState();
  const [loading, setLoading] = React.useState(true);

  const loadEntity = async () => {
    if (!symbol) {
      return;
    }
    try {
      setLoading(true);
      // const { data: toSignTaskList } = await searchTask({ status: ['to_sign'] });
      const stock = await getStock(symbol);
      ReactDOM.unstable_batchedUpdates(() => {
        setStock(stock);
        setWatched(stock.watched);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadEntity();
  }, [symbol]);

  if (role !== 'free') {
    return null;
  }

  const handleToggleWatch = async watching => {
    stock.watched = watching;
    if (watching) {
      await watchStock(stock.symbol);
    } else {
      await unwatchStock(stock.symbol);
    }
    setWatched(watching);
  }

  return (
    <>
      {loading ? <Loading /> : <>
        <PageHeader
          style={{ paddingTop: 0 }}
          ghost={false}
          onBack={() => props.history.goBack()}
          title={<Space size="middle">
            <StockName value={stock} />
            {stock?.isOver ? <Tag color="yellow">over valued</Tag> : stock?.isUnder ? <Tag color="cyan">under valued</Tag> : null}
            <StockWatchButton size={20} value={watched} onChange={handleToggleWatch} />
          </Space>}
        />
        <Space direction="vertical" style={{ width: '100%' }}>
          <StockQuotePanel symbol={stock.symbol} />
          <Row gutter={20} wrap={false}>
            <Col flex="auto">
              <StockChart symbol={stock.symbol} period="1d" interval="5m" />
            </Col>
          </Row>
          <Row>
            <Col flex="auto">
              <Card size="small" type="inner" title={<>News</>}>
                <StockNewsPanel symbol={stock.symbol} />
              </Card>
            </Col>
          </Row>
        </Space>
      </>}
    </>
  );
};

StockFreePage.propTypes = {
  symbol: PropTypes.string.isRequired,
};

StockFreePage.defaultProps = {};

export default withRouter(StockFreePage);
