import React from 'react';
import PropTypes from 'prop-types';
import { List, Typography, Space, Image, Tooltip, Modal, Card } from 'antd';
import { withRouter } from 'react-router-dom';
import { DeleteOutlined, EyeOutlined, EyeInvisibleOutlined, LockFilled } from '@ant-design/icons';
import StockInfoCard from './StockInfoCard';
import { StockName } from './StockName';
import { FaCrown } from 'react-icons/fa';
import { IconContext } from "react-icons";
import { getStockEvcInfo } from 'services/stockService';
import { TimeAgo } from 'components/TimeAgo';
import { Loading } from './Loading';
import { GlobalContext } from 'contexts/GlobalContext';
import { filter, debounceTime } from 'rxjs/operators';
import * as moment from 'moment-timezone';
import ReactDOM from "react-dom";
import * as _ from 'lodash';
import { MemberOnlyCard } from './MemberOnlyCard';
import styled from 'styled-components';
import { NumberRangeDisplay } from './NumberRangeDisplay';

const { Paragraph, Text, Title } = Typography;


const Container = styled.table`
width: 100%;

.number {
  font-size: 20px;
  font-weight: 600;
}
`;

const TooltipLabel = props => <Tooltip title={props.message}>
  <Text type="secondary"><small>{props.children}</small></Text>
</Tooltip>

const StockEvcInfoPanel = (props) => {

  const { symbol } = props;
  const [data, setData] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const context = React.useContext(GlobalContext);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getStockEvcInfo(symbol) || {};
      ReactDOM.unstable_batchedUpdates(() => {
        setData(data);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, []);


  return (
    <Container>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <TooltipLabel message="How to use fair value">Fair Value</TooltipLabel>
          <NumberRangeDisplay className="number" lo={data.fairValueLo} hi={data.fairValueHi} empty={<Text type="warning"><small>N/A Cannot calculate</small></Text>} />
        </Space>
        <Space style={{ width: '100%', justifyContent: 'space-between', alignItems:'flex-start' }}>
          <TooltipLabel message="How to use support">Support</TooltipLabel>
          <Space direction="vertical" size="small" style={{alignItems: 'flex-end'}}>
            {data.supports?.map((s, i) => <NumberRangeDisplay className="number" key={i} lo={s.lo} hi={s.hi} />)}
          </Space>
        </Space>
        <Space style={{ width: '100%', justifyContent: 'space-between', alignItems:'flex-start'  }}>
          <TooltipLabel message="How to use resistance">Resistance</TooltipLabel>
          <Space direction="vertical" size="small" style={{alignItems: 'flex-end'}}>
            {data.resistances?.map((r, i) => <NumberRangeDisplay className="number" key={i} lo={r.lo} hi={r.hi} />)}
          </Space>
        </Space>
      </Space>
      </Container>
  );
};

StockEvcInfoPanel.propTypes = {
  symbol: PropTypes.string.isRequired
};

StockEvcInfoPanel.defaultProps = {
};

export default withRouter(StockEvcInfoPanel);
