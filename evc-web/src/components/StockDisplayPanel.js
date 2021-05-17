import { Button, Space, Row, Col, Modal } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { Loading } from 'components/Loading';
import StockNewsPanel from 'components/StockNewsPanel';
import StockChart from 'components/charts/StockChart';
import StockQuotePanel from 'components/StockQuotePanel';
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { NumberRangeDisplay } from 'components/NumberRangeDisplay';
import { TimeAgo } from 'components/TimeAgo';
import { Typography } from 'antd';
import StockRosterPanel from 'components/StockRosterPanel';
import StockInsiderTransactionPanel from 'components/StockInsiderTransactionPanel';
import StockPutCallRatioChart from 'components/charts/StockPutCallRatioChart';
import { MemberOnlyCard } from 'components/MemberOnlyCard';
import styled from 'styled-components';
import StockEvcInfoPanel from './StockEvcInfoPanel';
import { from } from 'rxjs';
import StockNextReportDatePanel from './StockNextReportDatePanel';
import { useMediaQuery } from 'react-responsive'
import {
  BarChartOutlined,
  LineChartOutlined,
  LockFilled,
} from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import StockUnpaidEvcInfoPanel from './StockUnpaidEvcInfoPanel';
import { GlobalContext } from 'contexts/GlobalContext';

const { Text } = Typography;

const StockDisplayPanel = (props) => {
  const { stock } = props;

  const [loading, setLoading] = React.useState(true);
  const [stockChartVisible, setStockChartVisible] = React.useState(false);
  const [putCallChartVisible, setPutCallChartVisible] = React.useState(false);
  const context = React.useContext(GlobalContext);

  const loadEntity = async () => {
    try {
      setLoading(true);
      // const { data: toSignTaskList } = await searchTask({ status: ['to_sign'] });
      ReactDOM.unstable_batchedUpdates(() => {
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const load$ = from(loadEntity()).subscribe();

    return () => {
      load$.unsubscribe();
    }
  }, []);

  const handleShowStockChart = () => {
    ReactDOM.unstable_batchedUpdates(() => {
      setStockChartVisible(true);
      setPutCallChartVisible(false);
    });
  }

  const handleShowPutCallRatioChart = () => {
    ReactDOM.unstable_batchedUpdates(() => {
      setStockChartVisible(false);
      setPutCallChartVisible(true);
    });
  }

  const showInlineStockChart = useMediaQuery({ query: '(min-width: 576px)' });

  const shouldHidePutCall = ['guest', 'free'].includes(context.role);

  return (
    <>
      {(loading || !stock) ? <Loading /> : <>
        {/* {!isGuest && <TagSelect value={stock.tags} tags={stockTags} readonly={!isAdminOrAgent} />} */}
        {/* {isAdminOrAgent && <AdminStockPublishPanel stock={stock} />} */}
        <Row gutter={[30, 30]} style={{ marginTop: 30 }}>
          <Col {...{ xs: 24, sm: 24, md: 24, lg: 24, xl: 10, xxl: 8 }}>
            <Row gutter={[30, 30]}>
              <Col {...{ xs: 24, sm: 24, md: 12, lg: 12, xl: 24, xxl: 24 }}>
                <StockQuotePanel symbol={stock.symbol} />
                <MemberOnlyCard title={<FormattedMessage id="text.nextReportDate" />} bodyStyle={{ height: 65 }} style={{ marginTop: 30 }}>
                  <StockNextReportDatePanel symbol={stock.symbol} />
                </MemberOnlyCard>
              </Col>
              <Col {...{ xs: 24, sm: 24, md: 12, lg: 12, xl: 24, xxl: 24 }}>
                <MemberOnlyCard
                  title={<FormattedMessage id="text.evcCoreInfo" />}
                  paidOnly={true}
                  bodyStyle={{ height: 274 }}
                  blockedComponent={
                      <StockUnpaidEvcInfoPanel fairValues={stock.fairValues || []} />
                  }>
                  <StockEvcInfoPanel symbol={stock.symbol} />
                </MemberOnlyCard>
              </Col>
            </Row>
          </Col>
          {showInlineStockChart && <Col {...{ xs: 24, sm: 24, md: 24, lg: 24, xl: 14, xxl: 16 }}>
            <StockChart symbol={stock.symbol} period="1d" interval="5m" />
          </Col>}

        </Row>
        {showInlineStockChart && <Row style={{ marginTop: 30 }}>
          <Col span={24}>
            <MemberOnlyCard title={<FormattedMessage id="text.optionPutCallRatio" />} paidOnly={true} bodyStyle={{ height: 450 }}>
              <StockPutCallRatioChart symbol={stock.symbol} />
            </MemberOnlyCard>
          </Col>
        </Row>}
        {!showInlineStockChart && <Row gutter={[30, 30]} style={{ marginTop: 30 }}>
          <Col span={12}>
            <Button block icon={<BarChartOutlined />} onClick={() => handleShowStockChart()}>
               {' '}<FormattedMessage id="text.stockChart" />
              </Button>
          </Col>
          <Col span={12}>
            <Button block icon={shouldHidePutCall ? <LockFilled/> : <LineChartOutlined />} onClick={() => handleShowPutCallRatioChart()} disabled={shouldHidePutCall}>
               {' '}<FormattedMessage id="text.optionPutCallRatio" />
            </Button>
          </Col>
        </Row>}
        <Row gutter={[30, 30]} style={{ marginTop: 30 }}>
          <Col {...{ xs: 24, sm: 24, md: 24, lg: 12, xl: 8, xxl: 6 }}>
            <MemberOnlyCard title={<FormattedMessage id="text.roster" />} bodyStyle={{ height: 500 }}>
              <StockRosterPanel symbol={stock.symbol} />
            </MemberOnlyCard>
          </Col>
          <Col {...{ xs: 24, sm: 24, md: 24, lg: 12, xl: 16, xxl: 18 }}>
            <MemberOnlyCard title={<FormattedMessage id="text.insiderTransactions" />} paidOnly={true} bodyStyle={{ height: 500 }}>
              <StockInsiderTransactionPanel symbol={stock.symbol} />
            </MemberOnlyCard>
          </Col>
        </Row>
        <Row style={{ marginTop: 30 }}>
          <Col span={24}>
            <MemberOnlyCard title={<FormattedMessage id="text.news" />} bodyStyle={{ height: 700 }}>
              <StockNewsPanel symbol={stock.symbol} />
            </MemberOnlyCard>
          </Col>
        </Row>

        <Modal
          visible={stockChartVisible}
          title={stock.symbol}
          onOk={() => setStockChartVisible(false)}
          onCancel={() => setStockChartVisible(false)}
          closable={true}
          destroyOnClose={true}
          maskClosable={true}
          footer={null}
          width="100vw"
          centered
          bodyStyle={{padding: 0}}
        >
          <StockChart symbol={stock.symbol} period="1d" interval="5m" />
        </Modal>
        {!shouldHidePutCall && <Modal
          visible={putCallChartVisible}
          title={stock.symbol}
          onOk={() => setPutCallChartVisible(false)}
          onCancel={() => setPutCallChartVisible(false)}
          closable={true}
          maskClosable={true}
          destroyOnClose={true}
          footer={null}
          width="100vw"
          centered
        >
          <StockPutCallRatioChart symbol={stock.symbol} />
        </Modal>}
      </>}

    </>
  );
};

StockDisplayPanel.propTypes = {
  stock: PropTypes.object.isRequired,
};

StockDisplayPanel.defaultProps = {};

export default withRouter(StockDisplayPanel);
