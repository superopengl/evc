import { Space, Row, Col } from 'antd';
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
const { Text } = Typography;

const OldFairValueContainer = styled.div`
display: flex;
flex-direction: column;
color: rgba(255, 255, 255, 0.75);
width: 100%;
align-items: center;

.ant-typography {
  color: rgba(255, 255, 255, 0.75);
}
`;

const StockDisplayPanel = (props) => {
  const { stock } = props;

  const context = React.useContext(GlobalContext);
  const { role } = context;
  const [hasPaid, setHasPaid] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [stockTags, setStockTags] = React.useState([]);

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
        {hasPaid && <TagSelect value={stock.tags} tags={stockTags} readonly={true} />}
        <Row gutter={[20, 20]} wrap={true} style={{ marginTop: 20 }}>
          <Col flex="0 0 auto">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <StockQuotePanel symbol={stock.symbol} />
              <MemberOnlyCard
                title="Fair Value"
                message="The latest fair value is only accessible to paid user"
                paidOnly={true}
                blockedComponent={
                  <OldFairValueContainer >
                    {stock.fairValues?.map((fv, i) => <Space key={i}>
                      {fv.lo ? <NumberRangeDisplay lo={fv.lo} hi={fv.hi} /> : <Text strong style={{color: 'white', fontWeight: 900}}>XXXX ~ XXXX</Text>}
                      <TimeAgo value={fv.date} showAgo={false} accurate={false} direction="horizontal" />
                    </Space>)}
                  </OldFairValueContainer>
                } />

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

StockDisplayPanel.propTypes = {
  stock: PropTypes.object.isRequired,
};

StockDisplayPanel.defaultProps = {};

export default withRouter(StockDisplayPanel);