import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Space, Tooltip, Row, Col, Button } from 'antd';
import { withRouter } from 'react-router-dom';
import { NumberRangeDisplay } from './NumberRangeDisplay';
import { StockWatchButton } from 'components/StockWatchButton';
import { StockName } from './StockName';
import { unwatchStock, watchStock, bellStock, unbellStock } from 'services/watchListService';
import { GlobalContext } from '../contexts/GlobalContext';
import styled from 'styled-components';
import { LockFilled } from '@ant-design/icons';
import { StockNoticeButton } from './StockNoticeButton';
import { filter, debounceTime } from 'rxjs/operators';
import { FormattedMessage } from 'react-intl';
import StockCustomTagSelect from './StockCustomTagSelect';
import { TagsOutlined } from '@ant-design/icons';

const { Text } = Typography;

const StyledTable = styled.table`
border: none;
width: 100%;
font-size: 0.8rem;

.hidden-info{
  // color: rgba(0,0,0,0.35);
  // background-color: rgba(0,0,0,0.05);
  // border-radius: 4px;
  // padding: 0 8px;
}

.text-color-level-0 {
  color: rgba(0,0,0,1);

  .ant-typography {
    color: rgba(0,0,0,1);
  }
}

.text-color-level-1 {
  color: rgba(0,0,0,0.55);
  font-size: 0.7rem;

  .ant-typography {
    color: rgba(0,0,0,0.55);
  }
}

.text-color-level-2 {
  color: rgba(0,0,0,0.35);
  font-size: 0.6rem;

  .ant-typography {
    color: rgba(0,0,0,0.35);
  }
}

tr {
  border-top: 1px solid rgba(0,0,0,0.05);

  &:first-child {
    border-top: none;
  }

  td:first-child {
    font-weight: 300;
    font-size: 0.8rem;
  }
}
`;

const StyledCard = styled(Card)`
.ant-card-head-title {
  text-align: left;
}

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

const StyledGuestCover = styled.div`
position: absolute;
top: 0;
bottom: 0;
left: 0;
right: 0;
display: flex;
align-items: center;
justify-content: center;
background-color: rgba(255,255,255,0.5);
// background-color: rgba(0,0,0,0.3);
display: flex;
flex-direction: column;

  &, .ant-typography {
    font-weight: 500;
    // font-size: 1.2rem;
    // color: #eeeeee;
    color: rgba(0,0,0,0.85);
  }
  // transform: rotate(-15deg);
`;

const TooltipLabel = props => <Tooltip title={props.message}>
  <Text type="secondary">{props.children}</Text>
</Tooltip>

const HiddenNumber = props => {
  const list = new Array(props.count || 1).fill(null);
  return list.map((x, i) => <Text className={`hidden-info`} key={i}><span style={{ filter: 'blur(4px)' }}>123.40 ~ 567.89</span></Text>)
}

const StockInfoCard = (props) => {

  const { value: stock, title, hoverable, actions, showWatch, showBell, showTags } = props;

  const [watched, setWatched] = React.useState(stock?.watched);
  const [belled, setBelled] = React.useState(stock?.belled);
  const [customTags, setCustomTags] = React.useState(stock?.customTags);
  const [editingTag, setEditingTag] = React.useState(false);
  const context = React.useContext(GlobalContext);
  const [priceEvent, setPriceEvent] = React.useState();

  const { role, event$ } = context;
  const isMember = role === 'member';
  const isGuest = role === 'guest';
  const shouldHideData = ['guest', 'free'].includes(role);

  React.useEffect(() => {
    const price$ = context.event$
      .pipe(
        filter(e => e.type === 'price'),
        filter(e => e.data?.symbol === stock.symbol),
        // debounceTime(1000),
      ).subscribe(e => {
        setPriceEvent(e.data);
      });
    return () => {
      price$.unsubscribe();
    }
  }, []);

  const handleToggleWatch = async watching => {
    if (watching) {
      await watchStock(stock.symbol);
    } else {
      await unwatchStock(stock.symbol);
    }
    setWatched(watching);
  }

  const handleToggleBell = async belling => {
    if (belling) {
      await bellStock(stock.symbol);
    } else {
      await unbellStock(stock.symbol);
    }
    setBelled(belling);
  }

  const toggleCustomTagEdit = async (e) => {
    e.stopPropagation();
    setEditingTag(!editingTag);
  }

  const { isOver, isUnder } = stock;
  const className = isOver ? 'over-valued' : isUnder ? 'under-valued' : null;

  const lastPrice = +(priceEvent?.price) || +(stock.lastPrice);

  return <StyledCard
    size="small"
    className={className}
    bordered={false}
    type="inner"
    title={title ?? <StockName value={stock} />}
    extra={isMember && <Space>
      {showTags && <Button icon={<TagsOutlined />} type="link" onClick={toggleCustomTagEdit} />}
      {showBell && <StockNoticeButton value={belled} onChange={handleToggleBell} />}
      {showWatch && <StockWatchButton value={watched} onChange={handleToggleWatch} />}
    </Space>}
    onClick={props.onClick}
    hoverable={hoverable}
    actions={actions}
  >
    {editingTag && <Row style={{ marginBottom: 8 }}>
      <StockCustomTagSelect value={customTags?.map(x => x.id)} onChange={toggleCustomTagEdit} />
    </Row>}
    <Row style={editingTag ? { filter: 'opacity(0.2)' } : null}>
      <Col flex="none">
        <Text style={{ fontSize: '1.5rem', marginRight: '1rem' }}>{lastPrice ? lastPrice.toFixed(2) : 'N/A'}</Text>
      </Col>
      <Col flex="auto">
        <StyledTable>
          <tbody>
            <tr>
              <td>
                <TooltipLabel message="How to use fair value">
                  <FormattedMessage id="text.fairValue" />
                </TooltipLabel>
              </td>
              <td style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                {shouldHideData ? <HiddenNumber /> : <NumberRangeDisplay lo={stock.fairValueLo} hi={stock.fairValueHi} empty={<Text type="warning"><small>N/A Cannot calculate</small></Text>} />}
              </td>
            </tr>
            <tr>
              <td style={{ verticalAlign: 'top' }}>
                <TooltipLabel message="How to use support">
                  <FormattedMessage id="text.support" />
                </TooltipLabel>
              </td>
              <td style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                {shouldHideData ? <HiddenNumber count={2} /> : stock.supports?.length ? stock.supports.map((s, i) => shouldHideData ? <HiddenNumber /> : <NumberRangeDisplay className={`text-color-level-${i}`} key={i} lo={s.lo} hi={s.hi} />) : null}
              </td>
            </tr>
            <tr>
              <td style={{ verticalAlign: 'top' }}>
                <TooltipLabel message="How to use resistance">
                  <FormattedMessage id="text.resistance" />
                </TooltipLabel>
              </td>
              <td style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                {shouldHideData ? <HiddenNumber count={2} /> : stock.resistances?.length ? stock.resistances.map((r, i) => <NumberRangeDisplay className={`text-color-level-${i}`} key={i} lo={r.lo} hi={r.hi} />) : null}
              </td>
            </tr>
          </tbody>
        </StyledTable>
      </Col>
    </Row>

    {shouldHideData && <StyledGuestCover>
      <LockFilled />
      <Text>
        <FormattedMessage id="text.fullFeatureAfterPay" />
      </Text>
      {/* {isGuest ?
        <Link to="/signup" onClick={e => e.stopPropagation()}>Click to sign up</Link> :
        <Link to="/account" onClick={e => e.stopPropagation()}>Click to upgrade</Link>} */}
    </StyledGuestCover>}
  </StyledCard>
};

StockInfoCard.propTypes = {
  value: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  actions: PropTypes.array,
  title: PropTypes.object,
  showWatch: PropTypes.bool,
  showBell: PropTypes.bool,
  showTags: PropTypes.bool,
};

StockInfoCard.defaultProps = {
  title: null,
  showWatch: true,
  showBell: false,
  showTags: false,
};

export default withRouter(StockInfoCard);
