import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Space, Tooltip, Button } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { NumberRangeDisplay } from './NumberRangeDisplay';
import { StockWatchButton } from 'components/StockWatchButton';
import { StockName } from './StockName';
import { unwatchStock, watchStock } from 'services/stockService';
import { GlobalContext } from '../contexts/GlobalContext';
import styled from 'styled-components';

const { Text } = Typography;

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

const HiddenNumber = props => {
  const list = new Array(props.count || 1).fill(null);
  return list.map((x, i) => <Text key={i}><small>XXX.XX ~ XXX.XX</small></Text>)
}

const StockInfoCard = (props) => {

  const { value: stock, title, hoverable, actions, showWatch } = props;

  const [watched, setWatched] = React.useState(stock?.watched);
  const context = React.useContext(GlobalContext);
  const { role } = context;
  const isMember = role === 'member';
  const shouldHideData = ['guest', 'free'].includes(role);

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

  const cardComponent = <StyledCard
    size="small"
    className={className}
    bordered={false}
    type="inner"
    title={<Space style={{ width: '100%', justifyContent: 'space-between' }}>
      {title ?? <StockName value={stock} />}
      {/* {titleSuffix && <Tag>{titleSuffix}</Tag>} */}
      {isMember && showWatch && <StockWatchButton value={watched} onChange={handleToggleWatch} />}
    </Space>}
    onClick={props.onClick}
    hoverable={hoverable}
    actions={actions}
  >
    <StyledTable>
      <tbody>
        <tr>
          <td>
          <TooltipLabel message={null}>Price</TooltipLabel>
          </td>
          <td>
            {stock.lastPrice}
          </td>
        </tr>
        <tr>
          <td>
            <TooltipLabel message="How to use fair value">Fair Value</TooltipLabel>
          </td>
          <td>
            {shouldHideData ? <HiddenNumber /> : <NumberRangeDisplay lo={stock.fairValueLo} hi={stock.fairValueHi} empty={<Text type="warning"><small>N/A Cannot calculate</small></Text>} />}
          </td>
        </tr>
        <tr>
          <td style={{ verticalAlign: 'top' }}>
            <TooltipLabel message="How to use resistance">Resistance</TooltipLabel>
          </td>
          <td style={{ display: 'flex', flexDirection: 'column' }}>
            {shouldHideData ? <HiddenNumber count={2} /> : stock.resistances?.length ? stock.resistances.map((r, i) => <NumberRangeDisplay key={i} lo={r.lo} hi={r.hi} />) : null}
          </td>
        </tr>
        <tr>
          <td style={{ verticalAlign: 'top' }}>
            <TooltipLabel message="How to use support">Support</TooltipLabel>
          </td>
          <td style={{ display: 'flex', flexDirection: 'column' }}>
            {shouldHideData ? <HiddenNumber count={2} /> : stock.supports?.length ? stock.supports.map((s, i) => shouldHideData ? <HiddenNumber /> : <NumberRangeDisplay key={i} lo={s.lo} hi={s.hi} />) : null}
          </td>
        </tr>
      </tbody>
    </StyledTable>
  </StyledCard>

  return shouldHideData ?
    <Tooltip
      title={<>Data is visible after subscripton upgrade. <Link to="/account" onClick={e => e.stopPropagation()}>Click to upgrade</Link></>}
    >
      {cardComponent}
    </Tooltip> :
    <>{cardComponent}</>


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
