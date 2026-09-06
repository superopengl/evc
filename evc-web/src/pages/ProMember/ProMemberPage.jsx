import { Alert, Button, Card, Space, Modal, Image, Row, Col, Listy, Tooltip, Tag, Flex, Table, Descriptions } from 'antd';
import React from 'react';
import { Typography } from 'antd';
import styled from 'styled-components';
import { StockNoticeButton } from 'components/StockNoticeButton';
import { StockWatchButton } from 'components/StockWatchButton';
import { withRouter } from 'util/withRouter';
import SignUpForm from 'components/SignUpForm';
import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import putCallData from './putCallData';
import rosterListData from './rosterData';
import newsListData from './newsData';
import { FormattedMessage } from 'react-intl';
import { useMediaQuery } from 'react-responsive'
import { TimeAgo } from 'components/TimeAgo';
import { PageHeader } from 'components/PageHeader';
import { StockName } from 'components/StockName';
import { SectionTitleDivider } from 'components/SectionTitleDivider';
import { NumberValueDisplay } from 'components/NumberValueDisplay';
import { ListyItemMeta } from 'components/ListyItemMeta';
import { IconContext } from 'react-icons';
import { MdOpenInNew } from 'react-icons/md';

import { Joyride, ACTIONS, EVENTS, STATUS } from 'react-joyride';
import {
  BarChartOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import INSIDER_LEGEND_INFOS from '../../def/insiderLegendDef';
import dayjs from 'util/dayjs';

const { Paragraph, Text } = Typography;

/**
 * A public, API-free replica of the member stock page (components/StockDisplayPanel), on a made-up
 * symbol, so a visitor can see what a Pro Member gets before signing up.
 *
 * Everything here is hardcoded on purpose - the page is reachable while logged out, and every
 * panel the real page uses fetches from an endpoint that would 401 (or, worse for a sales page,
 * render a MemberOnlyCard's paywall over the very features being advertised).
 *
 * **Build the replica out of real components, never out of copied DOM.** The page used to be
 * ~700 lines of antd 4 markup captured from a live browser - `<div class="ant-card">`, an
 * `EVC_CORE_INFO` HTML string fed through dangerouslySetInnerHTML, even stale styled-components
 * hashes like `sc-jcwpoC kyvWZW`. antd 6 emits its CSS-in-JS under
 * `:where(.css-dev-only-do-not-override-<hash>).ant-card ...` and puts a matching `css-var-*`
 * class on the component root, so markup that antd did not render matches *none* of those rules:
 * the cards lost their padding, border and min-height and collapsed into bare green title bars,
 * and the index tags ran together into one dark strip. The hash is per-build, so it cannot be
 * hardcoded back in. Composing the same primitives the real panels compose is what keeps this
 * page upright across the next antd upgrade.
 */

const Container = styled.div`
margin: 0;
padding: 30px 0;
background-color: #f0f2f5;
position:relative;

.ant-card-head {
  background-color: #3f9e48;

  .ant-card-head-title {
    color: rgba(255,255,255,0.9);
  }
}

.current-element {
  filter: brightness(1);
  width: 100%;
  outline: 4px solid red;
  border-radius: 6px;
}
`;

const ContainerBody = styled.div`
margin: 0 auto;
max-width: 1400px;
`;

// List -> Listy. `grid={{column: 1}}` was a plain vertical stack; the styled(List) wrapper
// only zeroed the item's horizontal padding, which is styles.item now.
const ROSTER_ITEM_STYLE = { paddingInline: 0, paddingBlock: 8 };

// Insider rows come from a JSON blob with no id, so compose the required rowKey.
const rosterRowKey = item =>
  `${item.fullName}.${item.filingDate}.${item.transactionDate}.${item.transactionCode}.${item.transactionShares}`;

const RosterContainer = styled(Space)`
.ant-descriptions-title {
  font-size: 14px;
  // color: #3273A4 !important;
}

.ant-descriptions-item-label {
  font-size: 0.9rem;
  color: rgba(0,0,0,0.45);
}

.ant-descriptions-header {
  margin: 0;
}

.ant-descriptions-item {
  padding-bottom: 2px !important;
}
`;

const insiderSpan = {
  xs: 1,
  sm: 2,
  md: 2,
  lg: 1,
  xl: 2,
  xxl: 3
};

/**
 * Off, exactly as it is in StockDisplayPanel - there is no insider data provider. It is a module
 * constant rather than a local so the tour can read it too: its `#tour-insider` step targets a
 * section that only exists when this is true, and a step whose target never appears is a
 * `error:target_not_found` failure that strands the tour.
 */
const SHOW_ROSTER = false;

// ---------------------------------------------------------------------------------------------
// The made-up figures. One block, so it is obvious at a glance that nothing here is live data.
// ---------------------------------------------------------------------------------------------

const DEMO_STOCK = { symbol: 'EVCT', company: 'Easy Value Check Inc' };

const DEMO_TAGS = [
  'S&P 500',
  'Dow Jones 30',
  'Nasdaq 100',
  'Nasdaq Composite',
  'S&P 100',
  'Russell 1000',
  'Russell 3000',
  'S&P 500 Information Technology',
];

const DEMO_QUOTE = {
  price: '133.67',
  delta: '+0.720 (+0.536%)',
  priceAt: '5 Dec 2023',
  extendedPrice: '25.98',
  extendedDelta: '+0.010 (+0.039%)',
};

const DEMO_EVC_INFO = {
  reportDate: '2 Dec 2023',
  fairValue: [177.19, 187.84],
  forwardNextFyFairValue: [190.68, 205.27],
  forwardNextFyMaxValue: [199.77, 208.92],
  beta: 1.17,
  peRatio: 31.77,
  forwardPeRatio: 30.04,
};

const DEMO_NEXT_REPORT_DATE = '7 Dec 2023';

const DEMO_PUTCALL_ROW = {
  key: 'evct',
  symbol: 'EVCT',
  date: '07 Dec 2023',
  todayOptionVol: 884200,
  todayPercentPutVol: 46.59,
  todayPercentCallVol: 53.41,
  putCallOIRatio: 0.95,
  totalOpenInterest: 7218375,
};

const TRADINGVIEW_SRC = 'https://s.tradingview.com/widgetembed/?frameElementId=tradingview_f5b45&symbol=AAPL&interval=D&hidelegend=1&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=F1F3F6&studies=%5B%5D&hideideas=1&theme=Light&style=1&timezone=America%2FNew_York&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=AAPL';

const WalkthroughTour = withRouter((props) => {

  const { visible: visibleProp, onClose, onComplete } = props;

  const [visible, setVisible] = React.useState(visibleProp);


  React.useEffect(() => {
    setVisible(visibleProp);
  }, [visibleProp])

  /**
   * `skipBeacon`, not `disableBeacon`: react-joyride 3 renamed it (and moved it onto the shared
   * step Options). Under the old name the flag was silently ignored, so instead of opening on
   * the first target the tour parked a lone pulsing dot next to the EVC panel and waited for a
   * click nobody knew to make - which is what "the tour doesn't work" looked like on screen.
   */
  const tourConfig = [
    {
      target: '#tour-fair-value',
      placement: 'auto',
      skipBeacon: true,
      content: <>
        <Paragraph strong>
          <FormattedMessage id="tour.fairValueTitle" />
        </Paragraph>
        <Paragraph style={{ fontSize: 14 }}>
          <FormattedMessage id="tour.fairValueDescription" />
        </Paragraph>
        <Paragraph type="danger" style={{ fontSize: 14 }}>
          <FormattedMessage id="tour.fairValueNote" />
        </Paragraph>
      </>
    },
    {
      target: '#tour-forward-next-fy-fair-value',
      placement: 'auto',
      skipBeacon: true,
      content: <>
        <Paragraph strong>
          <FormattedMessage id="tour.forwardNextFyFairValueTitle" />
        </Paragraph>
        <Paragraph style={{ fontSize: 14 }}>
          <FormattedMessage id="tour.forwardNextFyFairValueDescription" />
        </Paragraph>
        <Paragraph type="danger" style={{ fontSize: 14 }}>
          <FormattedMessage id="tour.forwardNextFyFairValueNote" />
        </Paragraph>
      </>
    },
    {
      target: '#tour-forward-next-fy-fair-value-range',
      placement: 'auto',
      skipBeacon: true,
      content: <>
        <Paragraph strong>
          <FormattedMessage id="tour.forwardNextFyFairValueRangeTitle" />
        </Paragraph>
        <Paragraph style={{ fontSize: 14 }}>
          <FormattedMessage id="tour.forwardNextFyFairValueRangeDescription" />
        </Paragraph>
        <Paragraph type="danger" style={{ fontSize: 14 }}>
          <FormattedMessage id="tour.forwardNextFyFairValueRangeNote" />
        </Paragraph>
      </>
    },
    {
      target: '#tour-putcall',
      placement: 'auto',
      skipBeacon: true,
      content: <>
        <Paragraph strong>
          <FormattedMessage id="tour.putCallTitle" />
        </Paragraph>
        <Paragraph style={{ fontSize: 12 }}>
          <FormattedMessage id="tour.putCallDescription" />
        </Paragraph>
        <Paragraph type="danger" style={{ fontSize: 12 }}>
          <FormattedMessage id="tour.putCallNote" />
        </Paragraph>
      </>
    },
    {
      target: '#tour-putcall-table',
      placement: 'auto',
      skipBeacon: true,
      content: <>
        <Paragraph strong>
          <FormattedMessage id="tour.putCallTableTitle" />
        </Paragraph>
        <Paragraph style={{ fontSize: 12 }}>
          <FormattedMessage id="tour.putCallTableDescription" />
        </Paragraph>
        <Paragraph type="danger" style={{ fontSize: 12 }}>
          <FormattedMessage id="tour.putCallTableNote" />
        </Paragraph>
      </>
    },
    // Only reachable when the insider section is rendered - see SHOW_ROSTER.
    SHOW_ROSTER ? {
      target: '#tour-insider',
      placement: 'auto',
      skipBeacon: true,
      content: <>
        <Paragraph strong>
          <FormattedMessage id="tour.insiderTitle" />
        </Paragraph>
        <Paragraph style={{ fontSize: 12 }}>
          <FormattedMessage id="tour.insiderDescription" />
        </Paragraph>
      </>
    } : null,
    {
      target: '#tour-alert',
      placement: 'auto',
      skipBeacon: true,
      content: <>
        <Paragraph strong>
          <FormattedMessage id="tour.alertTitle" />
        </Paragraph>
        <Paragraph style={{ fontSize: 12 }}>
          <FormattedMessage id="tour.alertDescription" />
        </Paragraph>
      </>
    },
  ].filter(x => !!x);

  /**
   * react-joyride 3 renamed `callback` to `onEvent` and replaced the v2 action vocabulary with
   * events. `callback` is not in the v3 prop list at all, so it was accepted and dropped: Skip
   * and the last Next both ran the tour to its end and then left the page exactly as it was -
   * no sign-up modal, and `visible` still true, so restarting the tour did nothing either.
   *
   * One event carries both outcomes now. TOUR_END fires for a finished *and* a skipped tour, and
   * `status` is what tells them apart; ACTIONS.CLOSE is the separate case of dismissing a single
   * step (ESC, or clicking the overlay).
   */
  const handleTourEvent = data => {
    const { type, status, action } = data;

    if (type === EVENTS.TOUR_END) {
      if (status === STATUS.FINISHED) {
        onComplete();
      }
      onClose();
    } else if (action === ACTIONS.CLOSE) {
      onClose();
    }
  }

  return <Joyride
    steps={tourConfig}
    run={visible}
    continuous={true}
    onEvent={handleTourEvent}
    // v2's styles.options is v3's `options`, and the theme keys moved with it. `showSkipButton`
    // is gone too - the tooltip's buttons are declared outright, and 'skip' is one of them.
    // 'close' is deliberately left out: it is the X that advances a step, which reads as a
    // second, contradictory Next next to the real one.
    options={{
      primaryColor: '#3f9e48',
      width: 600,
      zIndex: 1000,
      buttons: ['back', 'skip', 'primary'],
    }}
    styles={{
      tooltipContainer: {
        textAlign: 'left'
      },
      tooltip: {
        fontSize: 14
      }
    }}
  />
});

const PutCallDummyChart = () => {
  const data = putCallData.map(x => ({
    ...x,
    value: +(x.value.toFixed(2))
  }));

  const config = {
    data: data,
    xField: 'date',
    yField: 'value',
    // v4's `seriesField` both split and coloured the lines; in G2 v5 `encode.series` only splits,
    // and `colorField` is what does both (MaybeSeries infers the series from the color channel).
    colorField: 'type',
    //// Don't enable axis.x, which will break tooltip on window resizing.
    // axis: { x: { ... } },
    scale: {
      y: { nice: true },
      // v4's top-level `color: [...]` array is now the color scale's range.
      color: { range: ['#1570FF', '#ffc53d', '#F31dab'] },
    },
    axis: {
      y: {
        position: 'right',
        tickCount: 10,
        labelFormatter: (label) => {
          const value = +label;

          return value === 100 ? '0%\n1.0' : value < 100 ? (value / 100).toFixed(1) : (value - 100) + '%';
        },
        grid: true,
        gridLineWidth: 0.5,
        gridLineDash: [3, 2],
      },
    },
    // @ant-design/charts 2 turns every `annotations` entry into a child mark verbatim, with none
    // of the parent's fields extended onto it. v4's `{type: 'line', start: ['min', 100], end:
    // ['max', 100]}` therefore became a plain `line` mark with no x/y encode, and G2's line mark
    // throws `Missing encode for x or y channel` for that. `lineY` is the reference-line mark:
    // `data: [100]` is read as its y encode, against the shared y scale.
    annotations: [
      {
        type: 'lineY',
        data: [100],
        style: {
          lineWidth: 1,
          stroke: '#AAAAAA',
        },
      },
    ],
    tooltip: {
      items: [
        (d) => {
          const { value: rawValue, type } = d;
          switch (type) {
            case 'Today %Put Vol':
            case 'Today %Call Vol':
              return { name: type, value: `${(rawValue - 100).toFixed(2)} % ` };
            default:
              return { name: type, value: (rawValue / 100).toFixed(3) };
          }
        },
      ],
    },
    style: {
      lineWidth: 2.0,
    },
  };

  return <Line {...config} />
}

/**
 * components/MemberOnlyCard with the member gate taken out - same `type`/`variant`/`size` and the
 * same `#00293d` head text, so the demo's panels sit at the same weight as the real ones, but
 * nothing here is ever swapped for the paywall. (The green head fill comes from Container above,
 * which is where MemberOnlyCard's own styled(Card) puts it.)
 */
const DemoCard = ({ children, styles: propStyles, ...other }) => (
  <Card
    type="inner"
    variant="borderless"
    size="small"
    {...other}
    styles={{
      ...propStyles,
      body: { ...propStyles?.body, overflow: 'auto' },
      header: { color: '#00293d' },
    }}
  >
    {children}
  </Card>
);

const TooltipLabel = props => <Text type="secondary">{props.children}</Text>

// components/StockQuotePanel, minus the fetch and the price-event subscription. The deltas are
// pre-formatted strings rather than numbers run back through the panel's formatter: they are
// invented figures, and spelling them the way they appear keeps the demo data readable.
const DemoQuotePanel = () => {
  const superNarrow = useMediaQuery({ query: '(max-width: 465px)' });

  return (
    <Card size="middle" title={null} styles={{ body: { minHeight: 178 } }}>
      <Space size="small" orientation="vertical">
        <div>
          <Text style={{ fontSize: 30 }} strong>
            {DEMO_QUOTE.price} <Text type="success"><small>{DEMO_QUOTE.delta}</small></Text>
          </Text>
          <div><Text type="secondary"><small>Price At: {DEMO_QUOTE.priceAt} EST</small></Text></div>
        </div>
        <div>
          <Text style={{ fontSize: 20 }} strong>
            {DEMO_QUOTE.extendedPrice} <Text type="success"><small>{DEMO_QUOTE.extendedDelta}</small></Text>
          </Text>
          <div>
            <Space size="small" style={{ width: '100%', alignItems: 'flex-start' }}>
              <Text type="secondary"><small>extended hours</small></Text>
              <TimeAgo direction={superNarrow ? 'vertical' : 'horizontal'} value={dayjs().add(-1, 'day').toDate()} />
            </Space>
          </div>
        </div>
      </Space>
    </Card>
  );
};

// components/StockEvcInfoPanel, minus the fetch. The three tour anchors live on the rows the tour
// talks about, which is the whole reason this panel is spelled out rather than screenshotted.
const DemoEvcInfoPanel = () => (
  <Space orientation="vertical" style={{ width: '100%' }}>
    <SectionTitleDivider title={<Text><FormattedMessage id="text.reportDate" />: {DEMO_EVC_INFO.reportDate}</Text>} />
    <Space id="tour-fair-value" style={{ width: '100%', justifyContent: 'space-between' }}>
      <TooltipLabel><FormattedMessage id="text.fairValue" /></TooltipLabel>
      <NumberValueDisplay className="number" value={DEMO_EVC_INFO.fairValue} />
    </Space>
    <Space id="tour-forward-next-fy-fair-value" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <TooltipLabel><FormattedMessage id="text.forwardNextFyFairValue" /></TooltipLabel>
      <NumberValueDisplay className="number" value={DEMO_EVC_INFO.forwardNextFyFairValue} />
    </Space>
    <Space id="tour-forward-next-fy-fair-value-range" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <TooltipLabel><FormattedMessage id="text.forwardNextFyMaxValue" /></TooltipLabel>
      <NumberValueDisplay className="number" value={DEMO_EVC_INFO.forwardNextFyMaxValue} />
    </Space>
    <SectionTitleDivider title={<FormattedMessage id="text.dailyUpdate" />} />
    <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <TooltipLabel><FormattedMessage id="text.beta" /></TooltipLabel>
      <NumberValueDisplay className="number" value={DEMO_EVC_INFO.beta} fixedDecimal={3} />
    </Space>
    <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <TooltipLabel><FormattedMessage id="text.peRatio" /></TooltipLabel>
      <NumberValueDisplay className="number" value={DEMO_EVC_INFO.peRatio} />
    </Space>
    <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <TooltipLabel><FormattedMessage id="text.forwardRatio" /></TooltipLabel>
      <NumberValueDisplay className="number" value={DEMO_EVC_INFO.forwardPeRatio} />
    </Space>
  </Space>
);

// pages/AdminDashboard/OptionPutCallPanel's columns for a single row. Its own table reads
// `context.role` and locks the three ratio columns behind a LockIcon for guests - which is
// precisely the data this page exists to advertise, so the demo states the columns itself.
const PUTCALL_COLUMNS = [
  {
    fixed: 'left',
    width: 40,
    align: 'center',
    render: () => <Button shape="circle" size="small" icon={<PlusOutlined />} type="text" disabled />
  },
  { title: 'Symbol', dataIndex: 'symbol', fixed: 'left', width: 100 },
  { title: 'Date', dataIndex: 'date', align: 'left' },
  { title: 'Today Option Volume', dataIndex: 'todayOptionVol', align: 'right', render: v => v.toLocaleString() },
  { title: 'Today %Put Vol', dataIndex: 'todayPercentPutVol', align: 'right', render: v => v.toFixed(2) + '%' },
  { title: 'Today %Call Vol', dataIndex: 'todayPercentCallVol', align: 'right', render: v => v.toFixed(2) + '%' },
  { title: 'Total P/C OI Ratio', dataIndex: 'putCallOIRatio', align: 'right', render: v => v.toFixed(3) },
  { title: 'Total Open Interest', dataIndex: 'totalOpenInterest', align: 'right', render: v => v.toLocaleString() },
];

const DemoPutCallTable = () => (
  <Table
    bordered={false}
    size="small"
    columns={PUTCALL_COLUMNS}
    dataSource={[DEMO_PUTCALL_ROW]}
    rowKey="key"
    pagination={false}
    scroll={{ x: 'max-content' }}
  />
);

// Hoisted out of the page component. It used to be created inside the render, which makes a new
// styled component on every pass - styled-components warns about exactly that, and it was the one
// warning this page logged on load. The responsive width is a style prop instead.
const NewsImage = styled(Image)`
cursor: pointer;
`;

const StyledNewsItem = styled.div`
.news-title {
  font-weight: 400;
}
&:hover {
  .news-title {
    color: #55B0D4;
    text-decoration: underline;
  }
}
`;

const NEWS_ITEM_STYLE = { padding: '12px 0', border: 'none' };

// components/StockNewsPanel, minus the fetch. The headlines carry no href on purpose: they are a
// sample of the feed, and a demo page should not send a visitor off to a three-year-old article.
const DemoNewsPanel = () => {
  const showImage = useMediaQuery({ query: '(min-width: 576px)' });
  const showBigImage = useMediaQuery({ query: '(min-width: 876px)' });

  return (
    <Listy
      items={newsListData}
      rowKey="id"
      styles={{ item: NEWS_ITEM_STYLE }}
      itemRender={item => (
        <StyledNewsItem>
          <ListyItemMeta
            avatar={showImage
              ? <NewsImage preview={false} src={item.image} style={{ width: showBigImage ? 200 : 100 }} />
              : null}
            title={
              <Space size="small" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text strong style={{ margin: 0 }} className="news-title">{item.headline}</Text>
                <div style={{ position: 'relative', top: 4 }}>
                  <IconContext.Provider value={{ color: '#3273A4', size: 20 }}><MdOpenInNew /></IconContext.Provider>
                </div>
              </Space>
            }
            description={
              <Paragraph ellipsis={{ rows: 3, expandable: false, symbol: 'more' }} style={{ color: '#555555' }}>
                {item.summary}
              </Paragraph>
            }
          />
        </StyledNewsItem>
      )}
    />
  );
};

const TradingViewChart = ({ height }) => (
  <div style={{ height, minWidth: 400 }}>
    <iframe
      title="EVCT chart"
      src={TRADINGVIEW_SRC}
      style={{ width: '100%', height: '100%', border: 0 }}
      scrolling="no"
      allowFullScreen
    />
  </div>
);

const ProMemberPage = (props) => {
  const [visible, setVisible] = React.useState(true);
  const [signUpVisible, setSignUpVisible] = React.useState(false);
  const [stockChartVisible, setStockChartVisible] = React.useState(false);
  const [putCallChartVisible, setPutCallChartVisible] = React.useState(false);

  const showInlineStockChart = useMediaQuery({ query: '(min-width: 576px)' });
  const superNarrow = useMediaQuery({ query: '(max-width: 465px)' });

  const handleShowStockChart = () => {
    setStockChartVisible(true);
    setPutCallChartVisible(false);
  }

  const handleShowPutCallRatioChart = () => {
    setStockChartVisible(false);
    setPutCallChartVisible(true);
  }

  const getBadgeComponent = (transactionType) => {
    const info = INSIDER_LEGEND_INFOS[transactionType];
    if (!info) return null;
    return <Tooltip title={info?.message ?? transactionType}>
      <Tag color={info?.color ?? '#888888'}>{transactionType}</Tag>
    </Tooltip>
  }

  const formatDate = (dateString) => {
    return dateString ? dayjs(dateString, 'YYYY-MM-DD').format('ll') : null;
  }

  return (
    <Container>
      <ContainerBody>
        <WalkthroughTour visible={visible} onClose={() => setVisible(false)} onComplete={() => setSignUpVisible(true)} />
        <Modal
          open={stockChartVisible}
          title={DEMO_STOCK.symbol}
          onOk={() => setStockChartVisible(false)}
          onCancel={() => setStockChartVisible(false)}
          closable={true}
          destroyOnHidden={true}
          footer={null}
          width="100vw"
          centered styles={{ body: { padding: 0 } }} mask={{ closable: true }}>
          <TradingViewChart height={649} />
        </Modal>
        <Modal
          open={putCallChartVisible}
          title={DEMO_STOCK.symbol}
          onOk={() => setPutCallChartVisible(false)}
          onCancel={() => setPutCallChartVisible(false)}
          closable={true}
          destroyOnHidden={true}
          footer={null}
          width="100vw"
          centered mask={{ closable: true }}>
          <PutCallDummyChart />
        </Modal>
        <Modal
          style={{ maxWidth: 'calc(100vw - 20px)', width: 300 }}
          width={340}
          open={signUpVisible}
          destroyOnHidden={true}
          onOk={() => setSignUpVisible(false)}
          onCancel={() => setSignUpVisible(false)}
          footer={null} mask={{ closable: true }}>
          <SignUpForm onOk={() => props.history.push('/')} />
        </Modal>
        <Alert
          type="success"
          icon={<InfoCircleOutlined />}
          showIcon
          description={<FormattedMessage id="text.startTourAlert" />}
          style={{ marginBottom: 30 }}
          action={
            <Button type="primary" onClick={() => setVisible(true)}>
              <FormattedMessage id="text.startTour" />
            </Button>
          }
        />
        <PageHeader
          style={{
            backgroundColor: 'white',
            padding: '30px 30px 14px',
          }}
          title={<StockName value={DEMO_STOCK} />}
          extra={[
            <Space key="actions" id="tour-alert">
              <StockNoticeButton size={20} value={true} />
              <StockWatchButton size={20} value={true} />
            </Space>
          ]}
        >
          {/* components/TagSelect's readonly branch: antd 6 dropped Tag's trailing margin, so the
              gap comes from Flex. Without it the eight index tags butt together into one bar. */}
          <Flex wrap gap="small">
            {DEMO_TAGS.map(tag => <Tag key={tag} color="#00293d">{tag}</Tag>)}
          </Flex>
        </PageHeader>
        <Row gutter={[30, 30]} style={{ marginTop: 30 }}>
          <Col {...{ xs: 24, sm: 24, md: 24, lg: 24, xl: 10, xxl: 8 }}>
            <Row gutter={[30, 30]}>
              <Col {...{ xs: 24, sm: 24, md: 12, lg: 12, xl: 24, xxl: 24 }}>
                <DemoQuotePanel />
                <DemoCard title={<FormattedMessage id="text.nextReportDate" />} styles={{ body: { height: 65 } }} style={{ marginTop: 30 }}>
                  <Space>
                    <Text strong style={{ fontSize: 20 }}>{DEMO_NEXT_REPORT_DATE}</Text>
                    {/* The date beside it is frozen demo data, but the relative phrase is not:
                        feeding TimeAgo the 2023 date would read "3 years ago" under a heading
                        that says *next* expected. The old page dodged this by hardcoding the
                        words "in 2 days" into the markup. */}
                    <TimeAgo value={dayjs().add(2, 'day').toDate()} showTime={false} accurate={false} direction="horizontal" />
                  </Space>
                </DemoCard>
              </Col>
              <Col {...{ xs: 24, sm: 24, md: 12, lg: 12, xl: 24, xxl: 24 }}>
                <DemoCard title={<FormattedMessage id="text.evcCoreInfo" />} styles={{ body: { height: 320 } }}>
                  <DemoEvcInfoPanel />
                </DemoCard>
              </Col>
            </Row>
          </Col>
          {showInlineStockChart && <Col {...{ xs: 24, sm: 24, md: 24, lg: 24, xl: 14, xxl: 16 }}>
            <TradingViewChart height={695} />
          </Col>}
        </Row>
        {showInlineStockChart && <Row gutter={[30, 30]} style={{ marginTop: 30 }}>
          <Col span={24} id="tour-putcall">
            <DemoCard title={<FormattedMessage id="text.optionPutCallRatio" />}>
              <PutCallDummyChart />
            </DemoCard>
          </Col>
        </Row>}
        {!showInlineStockChart && <Row gutter={[30, 30]} style={{ marginTop: 30 }}>
          <Col span={superNarrow ? 24 : 12}>
            <Button block type="primary" icon={<BarChartOutlined />} onClick={() => handleShowStockChart()}>
              {' '}<FormattedMessage id="text.stockChart" />
            </Button>
          </Col>
          <Col span={superNarrow ? 24 : 12}>
            <Button block type="primary" id="tour-putcall" icon={<LineChartOutlined />} onClick={() => handleShowPutCallRatioChart()}>
              {' '}<FormattedMessage id="text.optionPutCallRatio" />
            </Button>
          </Col>
        </Row>}
        <Row gutter={[30, 30]} style={{ marginTop: 30 }} id="tour-putcall-table">
          <Col span={24}>
            <DemoCard title={<FormattedMessage id="text.historicalDailyPutCallRatio" />} styles={{ body: { padding: 0 } }}>
              <DemoPutCallTable />
            </DemoCard>
          </Col>
        </Row>
        {SHOW_ROSTER && <Row gutter={[30, 30]} style={{ marginTop: 30 }} id="tour-insider">
          <Col {...{ xs: 24, sm: 24, md: 24, lg: 12, xl: 16, xxl: 18 }}>
            <DemoCard title={<FormattedMessage id="text.insiderTransactions" />} styles={{ body: { height: 500 } }}>
              <RosterContainer orientation="vertical" size="small" style={{ width: '100%' }}>
                <Space orientation="vertical" size="small" style={{ marginBottom: 24 }}>
                  {Object.entries(INSIDER_LEGEND_INFOS).map(([k, v]) => <div key={k}>
                    <Tag color={v.color}>{k}</Tag>
                    {v.message}
                  </div>)}
                </Space>
                <Listy
                  items={rosterListData}
                  rowKey={rosterRowKey}
                  styles={{ item: ROSTER_ITEM_STYLE }}
                  itemRender={item => (
                    <Descriptions
                      title={<Space>{item.fullName} {item.reportedTitle && <Text type="secondary" style={{ fontWeight: 400, fontSize: '0.8rem' }}>{item.reportedTitle}</Text>}</Space>}
                      size="small"
                      column={insiderSpan}
                      extra={getBadgeComponent(item.transactionCode)}
                    >
                      <Descriptions.Item label="Exercise price">{item.conversionOrExercisePrice}</Descriptions.Item>
                      <Descriptions.Item label="Filing date">{formatDate(item.filingDate)}</Descriptions.Item>
                      <Descriptions.Item label="Post shares">{item.postShares?.toLocaleString()}</Descriptions.Item>
                      <Descriptions.Item label="Transaction date">{formatDate(item.transactionDate)}</Descriptions.Item>
                      <Descriptions.Item label="Transaction price">{item.transactionPrice?.toLocaleString()}</Descriptions.Item>
                      <Descriptions.Item label="Transaction shares">{item.transactionShares?.toLocaleString()}</Descriptions.Item>
                      <Descriptions.Item label="Transaction value">{item.transactionValue?.toLocaleString()}</Descriptions.Item>
                    </Descriptions>
                  )}
                />
              </RosterContainer>
            </DemoCard>
          </Col>
        </Row>}
        <Row style={{ marginTop: 30 }}>
          <Col span={24}>
            <DemoCard title={<FormattedMessage id="text.news" />} styles={{ body: { maxHeight: 700 } }}>
              <DemoNewsPanel />
            </DemoCard>
          </Col>
        </Row>
      </ContainerBody>
    </Container>
  );
}

ProMemberPage.propTypes = {
};

export default withRouter(ProMemberPage);
