import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Space, Tooltip, Row, Col } from 'antd';
import { withRouter } from 'react-router-dom';
import { NumberRangeDisplay } from './NumberRangeDisplay';
import { StockWatchButton } from 'components/StockWatchButton';
import { StockCustomTagButton } from 'components/StockCustomTagButton';
import { StockName } from './StockName';
import { unwatchStock, watchStock, bellStock, unbellStock, saveStockCustomTags } from 'services/watchListService';
import { GlobalContext } from '../contexts/GlobalContext';
import styled from 'styled-components';
import { LockFilled } from '@ant-design/icons';
import { StockNoticeButton } from './StockNoticeButton';
import { filter } from 'rxjs/operators';
import { FormattedMessage } from 'react-intl';
import StockCustomTagSelect from './StockCustomTagSelect';
import { List } from 'antd';
import isObject from 'lodash/isObject';
import { SectionTitleDivider } from './SectionTitleDivider';
import moment from 'moment';

const { Text } = Typography;

const SHOW_SUPPORT_RESISTANCE = false;


const StyledList = styled(List)`
.ant-list-item {
  padding: 0 0 0 0;
  margin: 0;
  border: 0;
}
`;

const StyledCard = styled(Card)`
height: 100%;
display: flex;
flex-direction: column;

.ant-card-head {
  flex: 0 0 auto;
}

.ant-card-body {
  flex: 1 1 auto;
}

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
  <Text type="secondary" style={{ fontSize: '0.8rem' }}>{props.children}</Text>
</Tooltip>

const HiddenNumberPair = props => {
  const list = new Array(props.count || 1).fill(null);
  return list.map((x, i) => <Text className={`hidden-info`} key={i}><span style={{ filter: 'blur(4px)' }}>123.40 ~ 567.89</span></Text>)
}

const HiddenNumberSingle = props => {
  const list = new Array(props.count || 1).fill(null);
  return list.map((x, i) => <Text className={`hidden-info`} key={i}><span style={{ filter: 'blur(4px)' }}>123.40</span></Text>)
}

const StockInfoCard = (props) => {

  const { value: stock, title, hoverable, actions, showWatch, showBell, showTags } = props;

  const [watched, setWatched] = React.useState(stock?.watched);
  const [belled, setBelled] = React.useState(stock?.belled);
  const [customTags, setCustomTags] = React.useState(stock?.tags?.filter(x => !!x));
  const [editingTag, setEditingTag] = React.useState(false);
  const context = React.useContext(GlobalContext);
  const [priceEvent, setPriceEvent] = React.useState();

  const { role } = context;
  const isMember = role === 'member';
  const shouldHideData = ['guest', 'free'].includes(role);

  React.useEffect(() => {
    setWatched(stock?.watched);
    setBelled(stock?.belled);
    setCustomTags(stock?.tags?.filter(x => !!x));
  }, [stock]);

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

  const handleStockCustomTagsChange = async (tagIds) => {
    await saveStockCustomTags(stock.symbol, tagIds);
  }

  const toggleEditCustomTags = async (editing) => {
    setEditingTag(editing);
  }

  const handleCardClick = () => {
    if (editingTag) {
      setEditingTag(false);
    } else {
      props.onClick();
    }
  }

  const { isOver, isUnder } = stock;
  const className = isOver ? 'over-valued' : isUnder ? 'under-valued' : null;

  const lastPrice = +(priceEvent?.price) || +(stock.lastPrice);

  const cardDataSource = React.useMemo(() => [
    {
      tooltip: null,
      textKey: 'text.fairValue',
      value: {
        lo: stock.fairValueLo,
        hi: stock.fairValueHi,
      },
      isLoss: stock.isLoss,
      textKeyOnLoss: 'text.fairValueLoss',
    },
    {
      tooltip: null,
      textKey: 'text.forwardNextFyFairValue',
      value: {
        lo: stock.forwardNextFyFairValueLo,
        hi: stock.forwardNextFyFairValueHi,
      },
      isLoss: stock.isForwardNextFyFairValueLoss,
      textKeyOnLoss: 'text.forwardNextFyFairValueLoss',
    },
    {
      tooltip: null,
      textKey: 'text.forwardNextFyMaxValue',
      value: {
        lo: stock.forwardNextFyMaxValueLo,
        hi: stock.forwardNextFyMaxValueHi,
      },
      isLoss: stock.isForwardNextFyMaxValueLoss,
      textKeyOnLoss: 'text.forwardNextFyMaxValueLoss',
    },
  ], [stock]);

  const cardDailyUpdateDataSource = React.useMemo(() => [
    {
      tooltip: null,
      textKey: 'text.beta',
      value: stock.beta,
    },
    {
      tooltip: null,
      textKey: 'text.peRatio',
      value: stock.peRatio,
    },
    {
      tooltip: null,
      textKey: 'text.forwardRatio',
      value: stock.forwardPeRatio,
    },
  ], [stock]);

  return <StyledCard
    size="small"
    className={className}
    bordered={false}
    type="inner"
    title={title ?? <StockName value={stock} />}
    extra={isMember && <Space>
      {showTags && <StockCustomTagButton value={editingTag} onChange={toggleEditCustomTags} />}
      {showBell && <StockNoticeButton value={belled} onChange={handleToggleBell} />}
      {showWatch && <StockWatchButton value={watched} onChange={handleToggleWatch} />}
    </Space>}
    onClick={handleCardClick}
    hoverable={hoverable}
    actions={actions}
  >
    <Row style={editingTag ? { filter: 'opacity(0.2)' } : null} wrap={false}>
      <Col flex="none">
        <Text style={{ fontSize: '1.5rem', marginRight: '1rem' }}>{lastPrice ? lastPrice.toFixed(2) : <Text type="secondary">N/A</Text>}</Text>
      </Col>
      <Col flex="auto">
        <SectionTitleDivider title={<Text style={{ fontSize: '0.8rem' }}><FormattedMessage id="text.reportDate" />: {stock.fairValueDate ? moment(stock.fairValueDate).format('D MMM YYYY') : 'NONE'}</Text>} />
        <StyledList
          dataSource={cardDataSource}
          style={{ width: '100%', marginBottom: '1rem' }}
          renderItem={item => <List.Item>
            <Row gutter={4} justify='space-between' style={{ width: '100%' }}>
              <Col>
                <TooltipLabel message="">
                  <FormattedMessage id={item.textKey} />
                </TooltipLabel>
              </Col>
              <Col flex="auto" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {
                  isObject(item.value) ?
                    (shouldHideData ? <HiddenNumberPair /> : <NumberRangeDisplay lo={item.value.lo} hi={item.value.hi} empty={item.isLoss ? <Text type="danger"><small><FormattedMessage id={item.textKeyOnLoss} /></small></Text> : <Text type="warning"><small>NONE</small></Text>} />)
                    : (shouldHideData ? <HiddenNumberSingle /> : item.value ? <Text>{(+item.value).toFixed(2)}</Text> : <Text type="warning"><small>NONE</small></Text>)
                }
              </Col>
            </Row>
          </List.Item>}
        />
        <SectionTitleDivider title={<small><Text style={{ fontSize: '0.8rem' }} ><FormattedMessage id="text.dailyUpdate" /></Text></small>} />
        <StyledList
          dataSource={cardDailyUpdateDataSource}
          style={{ width: '100%' }}
          renderItem={item => <List.Item>
            <Row gutter={4} justify='space-between' style={{ width: '100%' }}>
              <Col>
                <TooltipLabel message="">
                  <FormattedMessage id={item.textKey} />
                </TooltipLabel>
              </Col>
              <Col flex="auto" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {
                  isObject(item.value) ?
                    (shouldHideData ? <HiddenNumberPair /> : <NumberRangeDisplay lo={item.value.lo} hi={item.value.hi} empty={item.isLoss ? <Text type="danger"><small><FormattedMessage id={item.textKeyOnLoss} /></small></Text> : <Text type="warning"><small>NONE</small></Text>} />)
                    : (shouldHideData ? <HiddenNumberSingle /> : item.value ? <Text>{(+item.value).toFixed(2)}</Text> : <Text type="warning"><small>NONE</small></Text>)
                }
              </Col>
            </Row>
          </List.Item>}
        />
        <table>
          <tbody>
            {SHOW_SUPPORT_RESISTANCE && <>
              <tr>
                <td style={{ verticalAlign: 'top' }}>
                  <TooltipLabel message="How to use support">
                    <FormattedMessage id="text.support" />
                  </TooltipLabel>
                </td>
                <td style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  {shouldHideData ? <HiddenNumberPair count={2} /> : stock.supports?.length ? stock.supports.map((s, i) => shouldHideData ? <HiddenNumberPair /> : <NumberRangeDisplay className={`text-color-level-${i}`} key={i} lo={s.lo} hi={s.hi} />) : null}
                </td>
              </tr>
              <tr>
                <td style={{ verticalAlign: 'top' }}>
                  <TooltipLabel message="How to use resistance">
                    <FormattedMessage id="text.resistance" />
                  </TooltipLabel>
                </td>
                <td style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  {shouldHideData ? <HiddenNumberPair count={2} /> : stock.resistances?.length ? stock.resistances.map((r, i) => <NumberRangeDisplay className={`text-color-level-${i}`} key={i} lo={r.lo} hi={r.hi} />) : null}
                </td>
              </tr>
            </>}

          </tbody>
        </table>
      </Col>
    </Row>
    {showTags && <div style={{ width: '100%', marginTop: 10 }} onClick={(e) => {
      e.stopPropagation();
      setEditingTag(true);
    }}>
      <StockCustomTagSelect
        value={customTags}
        onChange={handleStockCustomTagsChange}
        readonly={!editingTag}
        onBlur={() => toggleEditCustomTags(false)}
      />
    </div>}
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
