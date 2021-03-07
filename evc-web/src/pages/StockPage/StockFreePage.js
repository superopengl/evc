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
import TagSelect from 'components/TagSelect';
import { listStockTags } from 'services/stockTagService';
import { NumberRangeDisplay } from 'components/NumberRangeDisplay';
import { TimeAgo } from 'components/TimeAgo';
import { Typography, Skeleton } from 'antd';
import { MemberOnlyIcon } from 'components/MemberOnlyIcon';
import StockRosterPanel from 'components/StockRosterPanel';
import StockInsiderTransactionPanel from 'components/StockInsiderTransactionPanel';
import StockPutCallRatioChart from 'components/charts/StockPutCallRatioChart';
import { MemberOnlyCard } from 'components/MemberOnlyCard';

const { Text } = Typography;

const StockFreePage = (props) => {
  const { symbol } = props;

  const context = React.useContext(GlobalContext);
  const { role } = context;
  const [hasPaid, setHasPaid] = React.useState(false);
  const [stock, setStock] = React.useState();
  const [watched, setWatched] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const [stockTags, setStockTags] = React.useState([]);

  const loadEntity = async () => {
    if (!symbol) {
      return;
    }
    try {
      setLoading(true);
      // const { data: toSignTaskList } = await searchTask({ status: ['to_sign'] });
      const stock = await getStock(symbol);
      const tags = await listStockTags();
      ReactDOM.unstable_batchedUpdates(() => {
        setStock(stock);
        setStockTags(tags);
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

  React.useEffect(() => {
    setHasPaid(['admin', 'agent', 'member'].includes(role));
  }, [role]);

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
      {(loading || !stock) ? <Loading /> : <>
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

        <TagSelect value={stock.tags} tags={stockTags} readonly={true} />
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
          <Col span={18}>
            <MemberOnlyCard title={<>News</>}>
              <StockNewsPanel symbol={stock.symbol} />
            </MemberOnlyCard>
          </Col>
          <Col span={6}>
          <MemberOnlyCard title={<>Option Put-Call Ratio</>} paidOnly={true}>
              <StockPutCallRatioChart symbol={stock.symbol} />
            </MemberOnlyCard>
            <MemberOnlyCard title={<>Roster</>}>
              <StockRosterPanel symbol={stock.symbol} />
            </MemberOnlyCard>
            <MemberOnlyCard title={<>Insider Transactions</>} paidOnly={true}>
              <StockInsiderTransactionPanel symbol={stock.symbol} />
            </MemberOnlyCard>
          </Col>
          <Col flex="auto">
          </Col>
        </Row>

      </>}
    </>
  );
};

StockFreePage.propTypes = {
  symbol: PropTypes.string.isRequired,
};

StockFreePage.defaultProps = {};

export default withRouter(StockFreePage);
