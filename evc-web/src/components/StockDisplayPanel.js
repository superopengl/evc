import { Space, Row, Col, Divider } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { Loading } from 'components/Loading';
import { GlobalContext } from 'contexts/GlobalContext';
import { unwatchStock, watchStock } from 'services/stockService';
import StockNewsPanel from 'components/StockNewsPanel';
import StockChart from 'components/charts/StockChart';
import StockQuotePanel from 'components/StockQuotePanel';
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import TagSelect from 'components/TagSelect';
import { listStockTags } from 'services/stockTagService';
import { NumberRangeDisplay } from 'components/NumberRangeDisplay';
import { TimeAgo } from 'components/TimeAgo';
import { Typography } from 'antd';
import { MemberOnlyIcon } from 'components/MemberOnlyIcon';
import StockRosterPanel from 'components/StockRosterPanel';
import StockInsiderTransactionPanel from 'components/StockInsiderTransactionPanel';
import StockPutCallRatioChart from 'components/charts/StockPutCallRatioChart';
import { MemberOnlyCard } from 'components/MemberOnlyCard';
import styled from 'styled-components';
import * as moment from 'moment';
import StockAdminPanel from 'components/StockAdminPanel';
import StockEvcInfoPanel from './StockEvcInfoPanel';
const { Text } = Typography;

const OldFairValueContainer = styled.div`
display: flex;
flex-direction: column;
// color: rgba(255, 255, 255, 0.75);
width: 100%;
align-items: center;

.ant-typography {
  // color: rgba(255, 255, 255, 0.75);
}
`;

const span = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 12,
  xl: 12,
  xxl: 12
};

const spanRow1Col1 = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 8,
  xl: 8,
  xxl: 8
}

const StockDisplayPanel = (props) => {
  const { stock } = props;

  const context = React.useContext(GlobalContext);
  const { role } = context;
  const [hasPaid, setHasPaid] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [stockTags, setStockTags] = React.useState([]);

  const isAdminOrAgent = ['admin', 'agent'].includes(role);
  const isMember = role === 'member';
  const isFree = role === 'free';
  const isGuest = role === 'guest';

  const loadEntity = async () => {
    try {
      setLoading(true);
      // const { data: toSignTaskList } = await searchTask({ status: ['to_sign'] });
      const tags = await listStockTags();
      ReactDOM.unstable_batchedUpdates(() => {
        setStockTags(tags);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadEntity();
  }, []);

  React.useEffect(() => {
    setHasPaid(['admin', 'agent', 'member'].includes(role));
  }, [role]);

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
              </Col>
              <Col {...{ xs: 24, sm: 24, md: 12, lg: 12, xl: 24, xxl: 24 }}>
                <MemberOnlyCard
                  title="EVC Core Info"
                  message="The latest fair value is only accessible to paid user"
                  paidOnly={true}
                  bodyStyle={{ height: 243 }}
                  blockedComponent={
                    <OldFairValueContainer >
                      {stock.fairValues?.map((fv, i) => <Space key={i}>
                        {fv.lo ? <NumberRangeDisplay lo={fv.lo} hi={fv.hi} /> : <Text strong style={{ fontWeight: 900, filter: 'blur(4px)' }}>XXXX ~ XXXX</Text>}
                        <TimeAgo value={fv.date} showAgo={false} accurate={false} direction="horizontal" />
                      </Space>)}
                    </OldFairValueContainer>
                  }>
                  <StockEvcInfoPanel symbol={stock.symbol} />
                </MemberOnlyCard>
              </Col>
            </Row>
          </Col>
          <Col {...{ xs: 24, sm: 24, md: 24, lg: 24, xl: 14, xxl: 16 }}>
            <StockChart symbol={stock.symbol} period="1d" interval="5m" />

          </Col>
        </Row>
        <Row gutter={[30, 30]} style={{ marginTop: 30 }}>
          <Col {...{ xs: 24, sm: 24, md: 24, lg: 24, xl: 10, xxl: 8 }}>
            <MemberOnlyCard title={<>Insider Transactions</>} paidOnly={true} bodyStyle={{ height: 1080 }}>
              <StockInsiderTransactionPanel symbol={stock.symbol} />
            </MemberOnlyCard>
          </Col>
          <Col {...{ xs: 24, sm: 24, md: 24, lg: 24, xl: 14, xxl: 16 }}>
            <Row gutter={[30, 30]}>
              <Col span={24}>
                <MemberOnlyCard title={<>Option Put-Call Ratio</>} paidOnly={true} bodyStyle={{ height: 500 }}>
                  <StockPutCallRatioChart symbol={stock.symbol} />
                </MemberOnlyCard>
              </Col>
              <Col span={24}>
                <Row gutter={[30, 30]} wrap={true}>
                  <Col {...{ xs: 24, sm: 24, md: 24, lg: 24, xl: 24, xxl: 12 }}>
                    <MemberOnlyCard title={<>Roster</>} bodyStyle={{ height: 500 }}>
                      <StockRosterPanel symbol={stock.symbol} />
                    </MemberOnlyCard>
                  </Col>
                  <Col {...{ xs: 24, sm: 24, md: 24, lg: 24, xl: 24, xxl: 12 }}>
                    <MemberOnlyCard title={<>News</>} bodyStyle={{ height: 500 }}>
                      <StockNewsPanel symbol={stock.symbol} />
                    </MemberOnlyCard>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>


      </>}
    </>
  );
};

StockDisplayPanel.propTypes = {
  stock: PropTypes.object.isRequired,
};

StockDisplayPanel.defaultProps = {};

export default withRouter(StockDisplayPanel);
