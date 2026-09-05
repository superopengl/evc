import React from 'react';
import styled from 'styled-components';
import { Typography, Collapse, Tag, Badge, Table, Space } from 'antd';
import { Link } from 'react-router-dom';
import { withRouter } from 'util/withRouter';
import { Loading } from 'components/Loading';
import { getDashboard } from 'services/dashboardService';
import { CaretRightOutlined, DeleteOutlined } from '@ant-design/icons';
import { from } from 'rxjs';
import { deleteStockPlea } from 'services/stockService';
import { ConfirmDeleteButton } from 'pages/Stock/ConfirmDeleteButton';
import { TimeAgo } from 'components/TimeAgo';
import dayjs from 'util/dayjs';

const { Text, Paragraph } = Typography;

const ContainerStyled = styled.div`
width: 100%;

.ant-alert {
  margin-bottom: 10px;
}

`;


const StyledTag = styled(Tag)`
margin-bottom: 8px;
// font-size: 1rem;

&:hover {
  color: #55B0D4;
  text-decoration: underline !important;
}
`;

const CounterBadge = (props) => {
  const count = props.count || 0;
  const backgroundColor = count ? (props.color || '#d7183f') : '#AFAFAF';
  return <Badge overflowCount={9999} count={count} showZero style={{ backgroundColor }} />
}

/**
 * An empty panel has nothing to reveal, so it does not open: antd greys the header and sets
 * cursor: not-allowed, keeping the caret in place so the rows stay aligned (showArrow={false}
 * would drop the icon box and pull the label left of every other row).
 *
 * The count comes from the same length the badge renders, so the two cannot disagree - and
 * while the fetch is in flight `data` is {}, which reads as 0 and leaves every panel shut
 * rather than letting one open onto an empty table.
 */
const countedPanelProps = (count, color) => ({
  extra: <CounterBadge count={count} color={color} />,
  collapsible: count ? undefined : 'disabled',
});

/**
 * Six of the nine panels are the same four lines with a different heading and a different field
 * on `data` - a list of symbols rendered as links. They are generated from this instead of
 * repeated, which is what makes the move to `items` a net deletion.
 *
 * `onSupport` is a long-standing typo for one of the keys. It is kept: the key is only the
 * panel's identity for `accordion`, nothing persists it, and renaming it changes nothing.
 */
const SYMBOL_LIST_PANELS = [
  { key: 'invalidEps', label: 'No fair value (invalid EPS)', field: 'noFairValuesByInvalidTtmEps' },
  { key: 'noEps', label: 'No fair value (no EPS data)', field: 'noFairValuesByMissingEpsData' },
  { key: 'noSupport', label: 'No support', field: 'noSupports' },
  { key: 'noResistance', label: 'No resistance', field: 'noResistances' },
  { key: 'onSupport', label: 'One support', field: 'oneSupports' },
  { key: 'oneResistance', label: 'One resistance', field: 'oneResistances' },
];

const LinkTag = props => {
  return <Link to={props.to}>
    <StyledTag style={props.style}>{props.children}</StyledTag>
  </Link>
}

const stringNumberComparer = (a, b) => {
  const x = +a;
  const y = +b;
  return x === y ? 0 : x < y ? -1 : 1;
}

const stringDateComparer = (a, b) => {
  const x = dayjs(a).toDate();
  const y = dayjs(b).toDate();
  return x === y ? 0 : x < y ? -1 : 1;
}

const AdminDashboardPage = () => {

  const [data, setData] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const loadList = async () => {
    try {
      setLoading(true);
      const data = await getDashboard();

      setData(data);
      setLoading(false);
      
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const load$ = from(loadList()).subscribe();
    return () => {
      load$.unsubscribe()
    }
  }, []);

  const handleDeleteStockPlea = async (symbol) => {
    await deleteStockPlea(symbol);
    loadList();
  }

  const collapseItems = [
    {
      key: 'closeAlert',
      label: 'Not up-to-date close price',
      ...countedPanelProps(data.closeAlerts?.length),
      children: (
        <Table
          loading={loading}
          size="small"
          bordered={false}
          dataSource={data.closeAlerts}
          rowKey="symbol"
          pagination={false}
          columns={[
            {
              title: 'Symbol',
              dataIndex: 'symbol',
              sorter: (a, b) => a.symbol.localeCompare(b.symbol),
              render: value => <LinkTag to={`/stock/${value}`} style={{ margin: 0 }}>{value}</LinkTag>
            },
            {
              title: 'Close price',
              dataIndex: 'close',
              sorter: (a, b) => stringNumberComparer(a.close, b.close),
              render: value => +value
            },
            {
              title: 'Price date',
              dataIndex: 'date',
              sorter: (a, b) => stringDateComparer(a.date, b.date),
              render: value => <TimeAgo value={value} showAgo={false} accurate={false} />
            },
            {
              title: 'Data input time',
              dataIndex: 'createdAt',
              sorter: (a, b) => stringDateComparer(a.createdAt, b.createdAt),
              render: value => <TimeAgo value={value} showAgo={false} accurate={true} extra={<Text type="secondary">EST</Text>} />
            },
          ]}
        />
      ),
    },
    {
      key: 'unusualEps',
      label: 'Unusual EPS',
      ...countedPanelProps(data.unusualEps?.length),
      children: (
        <>
          <Paragraph type="secondary">
            Successive identical EPS values within 80 days. Spans ≤ 30 days within 3 months are tagged as <Tag color="warning">recent</Tag>
          </Paragraph>
          <Table
            loading={loading}
            size="small"
            bordered={false}
            dataSource={data.unusualEps}
            rowKey={item => `${item.symbol}.${item.reportDateFormer}`}
            pagination={false}
            columns={[
              {
                title: 'Symbol',
                dataIndex: 'symbol',
                sorter: (a, b) => a.symbol.localeCompare(b.symbol),
                render: (value) => <LinkTag to={`/stock/${value}`} style={{ margin: 0 }}>{value}</LinkTag>
              },
              {
                title: 'EPS value',
                dataIndex: 'value',
                sorter: (a, b) => stringNumberComparer(a.value, b.value),
                render: value => +value
              },
              {
                title: 'Report date',
                dataIndex: 'reportDateFormer',
                sorter: (a, b) => stringDateComparer(a.reportDateFormer, b.reportDateFormer),
                render: (value, item) => <Space size="small">
                  <TimeAgo value={item.reportDateFormer} showAgo={false} accurate={false} />
                  /
                  <TimeAgo value={item.reportDateLatter} showAgo={false} accurate={false} />
                </Space>
              },
              {
                title: 'Span (days)',
                dataIndex: 'span',
                sorter: (a, b) => stringNumberComparer(a.span, b.span),
                render: value => value
              },
              {
                title: 'Recent?',
                dataIndex: 'recent',
                sorter: (a, b) => {
                  const x = a.recent;
                  const y = b.recent;
                  return x === y ? 0 : x ? -1 : 1;
                },
                render: (value, item) => <>{item.recent && <Tag color="warning">recent</Tag>}</>
              }
            ]}
          />
        </>
      ),
    },
    {
      key: 'plea',
      label: 'Unsupported Stock Requests',
      ...countedPanelProps(data.pleas?.length, '#55B0D4'),
      children: (
        <Table
          loading={loading}
          size="small"
          bordered={false}
          dataSource={data.pleas}
          rowKey="symbol"
          pagination={false}
          columns={[
            {
              title: 'Symbol',
              dataIndex: 'symbol',
              sorter: (a, b) => a.symbol.localeCompare(b.symbol),
              render: (value) => <Space>
                <Tag>{value}</Tag>
                <Link to={`/stock?create=${value}`}>Click to create</Link>
              </Space>
            },
            {
              title: 'Request count',
              dataIndex: 'count',
              sorter: (a, b) => stringNumberComparer(a.count, b.count),
              render: value => +value
            },
            {
              align: 'right',
              render: (value, item) => <Space size="small">
                <ConfirmDeleteButton type="link" danger to={`/stock?create=${item.symbol}`}
                  message={<>Delete stock request <strong>{item.symbol}</strong>?</>}
                  icon={<DeleteOutlined />}
                  onOk={() => handleDeleteStockPlea(item.symbol)}
                />
              </Space>
            },
          ]}
        />
      ),
    },
    ...SYMBOL_LIST_PANELS.map(({ key, label, field }) => ({
      key,
      label,
      ...countedPanelProps(data[field]?.length),
      children: (
        <Paragraph>
          {data[field]?.map(x => <LinkTag key={x} to={`/stock/${x}`}>{x}</LinkTag>)}
        </Paragraph>
      ),
    })),
  ];

  return (
    <ContainerStyled>
      <Loading loading={loading}>
        {/* rc-collapse warns that panel `children` go away next major; `items` is the
            supported API. Note the per-panel prop is `label` there, not `header`. */}
        <Collapse
          // ghost
          bordered={false}
          defaultActiveKey={[]}
          accordion
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
          items={collapseItems}
        />
      </Loading>
    </ContainerStyled>
  );
};

AdminDashboardPage.propTypes = {};

export default withRouter(AdminDashboardPage);
