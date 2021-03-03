import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Space, Row, Col, Tooltip, Tag } from 'antd';
import { withRouter } from 'react-router-dom';
import { StarOutlined, StarFilled, QuestionCircleFilled } from '@ant-design/icons';
import { NumberRangeDisplay } from './NumberRangeDisplay';
import { TimeAgo } from 'components/TimeAgo';
import { StockWatchButton } from 'components/StockWatchButton';
import { StockName } from './StockName';
import { searchSingleStock, getStockHistory, getWatchList, unwatchStock, watchStock } from 'services/stockService';
import { GlobalContext } from '../contexts/GlobalContext';
import styled from 'styled-components';

const { Paragraph, Text } = Typography;

const StyledTable = styled.table`
border: none;
width: 100%;
`;

const StyledCard = styled(Card)`
&.over-valued {
  .ant-card-head {
    background: #ffffb8;
  }
  .ant-card-body {
    background: #feffe6;
  }
}

&.under-valued {
  .ant-card-head {
    background: #bffbff;
  }
  .ant-card-body {
    background: #e8feff;
  }
}

`;

const TooltipLabel = props => <Tooltip title={props.message}>
  <Text type="secondary"><small>{props.children}</small></Text>
</Tooltip>


const StockInfoCard = (props) => {

  const { value: stock, title, hoverable, actions, showWatch } = props;

  const [watched, setWatched] = React.useState(stock?.watched);
  const context = React.useContext(GlobalContext);
  const { user, role, setUser, notifyCount } = context;
  const isClient = role === 'member' || role === 'free';


  const handleToggleWatch = async watching => {
    if (watching) {
      await watchStock(stock.symbol);
    } else {
      await unwatchStock(stock.symbol);
    }
    setWatched(watching);
  }

  const { isOver, isUnder } = stock;
  const className = isOver ? 'over-valued' : isUnder ? 'under-valued' : null;
  const titleSuffix = isOver ? 'over' : isUnder ? 'under' : null;
  return (
    <StyledCard
      size="small"
      className={className}
      bordered={false}
      type="inner"
      title={<Space style={{ width: '100%', justifyContent: 'space-between' }}>
        {title ?? <StockName value={stock} />}
        {/* {titleSuffix && <Tag>{titleSuffix}</Tag>} */}
        {isClient && showWatch && <StockWatchButton value={watched} onChange={handleToggleWatch} />}
      </Space>}
      onClick={props.onClick}
      hoverable={hoverable}
      actions={actions}
    >
      <StyledTable>
        <tbody>

          <tr>
            <td>
              <TooltipLabel message="How to use fair value">Fair Value</TooltipLabel>
            </td>
            <td>
              <NumberRangeDisplay lo={stock.fairValueLo} hi={stock.fairValueHi} empty={<Text type="warning"><small>N/A Cannot calculate</small></Text>} />
            </td>
          </tr>
          <tr>
            <td style={{ verticalAlign: 'top' }}>
              <TooltipLabel message="How to use resistance">Resistance</TooltipLabel>
            </td>
            <td style={{ display: 'flex', flexDirection: 'column' }}>
              {stock.resistances?.length > 0 && stock.resistances.map((r, i) => <NumberRangeDisplay key={i} lo={r.lo} hi={r.hi} />)}
            </td>
          </tr>
          <tr>
            <td style={{ verticalAlign: 'top' }}>
              <TooltipLabel message="How to use support">Support</TooltipLabel>
            </td>
            <td style={{ display: 'flex', flexDirection: 'column-reverse' }}>
              {stock.supports?.length > 0 && stock.supports.map((s, i) => <NumberRangeDisplay key={i} lo={s.lo} hi={s.hi} />)}
            </td>
          </tr>
        </tbody>
      </StyledTable>
    </StyledCard>
  );
};

StockInfoCard.propTypes = {
  value: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  actions: PropTypes.array,
  title: PropTypes.object,
  showWatch: PropTypes.bool,
};

StockInfoCard.defaultProps = {
  title: null,
  showWatch: true,
};

export default withRouter(StockInfoCard);
