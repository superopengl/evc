import { Space, Row, Col, Card, PageHeader, Tag } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { Loading } from 'components/Loading';
import { getStockPreview } from 'services/stockService';
import { StockName } from 'components/StockName';
import StockNewsPanel from 'components/StockNewsPanel';
import StockChart from 'components/charts/StockChart';
import StockQuotePanel from 'components/StockQuotePanel';
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { NumberRangeDisplay } from 'components/NumberRangeDisplay';
import { TimeAgo } from 'components/TimeAgo';
import { Typography, Skeleton } from 'antd';
import { MemberOnlyIcon } from 'components/MemberOnlyIcon';

const { Text, Title } = Typography;

const StockGuestPage = (props) => {
  const { symbol } = props;

  const [stock, setStock] = React.useState();
  const [loading, setLoading] = React.useState(true);

  const loadEntity = async () => {
    if (!symbol) {
      return;
    }
    try {
      setLoading(true);
      // const { data: toSignTaskList } = await searchTask({ status: ['to_sign'] });
      const stock = await getStockPreview(symbol);
      ReactDOM.unstable_batchedUpdates(() => {
        setStock(stock);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadEntity();
  }, []);


  return (
    <>
      {(loading || !stock) ? <Loading /> : <>
        <Title level={1}>
          <Space size="middle">
            <StockName value={stock} />
            {stock?.isOver ? <Tag color="yellow">over valued</Tag> : stock?.isUnder ? <Tag color="cyan">under valued</Tag> : null}
          </Space>
        </Title>
        <Row gutter={[20, 20]} wrap={true} style={{ marginTop: 20 }}>
          <Col flex="0 0 auto">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <StockQuotePanel symbol={stock.symbol} />
              {stock.fairValues?.map((fv, i) => <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                {i === 0 ?
                  <Space>
                    <Skeleton.Input size="small" style={{ width: '9rem' }} shape="round" active={true} />
                    <MemberOnlyIcon />
                  </Space> :
                  <NumberRangeDisplay lo={fv.lo} hi={fv.hi} />}
                <div><Text type={i === 0 ? 'danger' : 'secondary'}>
                  <small>{i === 0 ? 'Latest' : 'Historical'} fair value at </small>
                </Text>
                  <TimeAgo value={fv.date} showAgo={false} accurate={false} />
                </div>
              </div>)}
            </Space>
          </Col>
          <Col flex="1 0 auto">
            <StockChart symbol={stock.symbol} period="1d" interval="5m" />
          </Col>
          <Col span={24}>
            <Card size="small" type="inner" title={<>News</>}>
              <StockNewsPanel symbol={stock.symbol} />
            </Card>
          </Col>
        </Row>

      </>}
    </>
  );
};

StockGuestPage.propTypes = {
  symbol: PropTypes.string.isRequired,
};

StockGuestPage.defaultProps = {};

export default withRouter(StockGuestPage);
