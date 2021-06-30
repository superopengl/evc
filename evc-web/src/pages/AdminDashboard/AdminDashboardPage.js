import React from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { Typography, Collapse, Tag, Badge, List, Table, Space } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { Loading } from 'components/Loading';
import { getDashboard } from 'services/dashboardService';
import { CaretRightOutlined, DeleteOutlined } from '@ant-design/icons';
import { from } from 'rxjs';
import { deleteStockPlea } from 'services/stockService';
import { ConfirmDeleteButton } from 'pages/Stock/ConfirmDeleteButton';
import { TimeAgo } from 'components/TimeAgo';
import * as moment from 'moment';

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
  const x = moment(a).toDate();
  const y = moment(b).toDate();
  return x === y ? 0 : x < y ? -1 : 1;
}

const AdminDashboardPage = () => {

  const [data, setData] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const loadList = async () => {
    try {
      setLoading(true);
      const data = await getDashboard();

      ReactDOM.unstable_batchedUpdates(() => {
        setData(data);
        setLoading(false);
      });
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

  return (
    <ContainerStyled>
      <Loading loading={loading}>
        <Collapse
          // ghost
          bordered={false}
          defaultActiveKey={[]}
          accordion
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        >
          <Collapse.Panel
            key="closeAlert"
            header={<>Not up-to-date close price</>}
            extra={<CounterBadge count={data.closeAlerts?.length} />}
          >
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
                  // align: 'right',
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
          </Collapse.Panel>
          <Collapse.Panel
            key="unusualEps"
            header={<>Unusual EPS</>}
            extra={<CounterBadge count={data.unusualEps?.length} />}
          >
            <Paragraph type="secondary">
            Successive identical EPS values within 80 days. Spans ≤ 30 days within 3 months are tagged as <Tag color="warning">recent</Tag>
            </Paragraph>
            <Table
              loading={loading}
              size="small"
              bordered={false}
              dataSource={data.unusualEps}
              rowKey="symbol"
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
                  // align: 'right',
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
                  // align: 'right',
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
          </Collapse.Panel>
          <Collapse.Panel
            key="plea"
            header={<>Unsupported Stock Requests </>}
            extra={<CounterBadge count={data.pleas?.length} color="#55B0D4" />}
          >
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
                  // align: 'right',
                  dataIndex: 'count',
                  sorter: (a, b) => stringNumberComparer(a.count, b.count),
                  render: value => +value
                },
                {
                  align: "right",
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
          </Collapse.Panel>
          <Collapse.Panel
            key="invalidEps"
            header={<>No fair value (invalid EPS)</>}
            extra={<CounterBadge count={data.noFairValuesByInvalidTtmEps?.length} />}
          >
            <Paragraph>
              {data.noFairValuesByInvalidTtmEps?.map(x => <LinkTag key={x} to={`/stock/${x}`}>{x}</LinkTag>)}
            </Paragraph>
          </Collapse.Panel>
          <Collapse.Panel
            key="noEps"
            header={<>No fair value (no EPS data)</>}
            extra={<CounterBadge count={data.noFairValuesByMissingEpsData?.length} />}
          >
            <Paragraph>
              {data.noFairValuesByMissingEpsData?.map(x => <LinkTag key={x} to={`/stock/${x}`}>{x}</LinkTag>)}
            </Paragraph>
          </Collapse.Panel>
          <Collapse.Panel
            key="noSupport"
            header={<>No support</>}
            extra={<CounterBadge count={data.noSupports?.length} />}
          >
            <Paragraph>
              {data.noSupports?.map(x => <LinkTag key={x} to={`/stock/${x}`}>{x}</LinkTag>)}
            </Paragraph>
          </Collapse.Panel>
          <Collapse.Panel
            key="noResistance"
            header={<>No resistance</>}
            extra={<CounterBadge count={data.noResistances?.length} />}
          >
            <Paragraph>
              {data.noResistances?.map(x => <LinkTag key={x} to={`/stock/${x}`}>{x}</LinkTag>)}
            </Paragraph>
          </Collapse.Panel>
          <Collapse.Panel
            key="onSupport"
            header={<>One support</>}
            extra={<CounterBadge count={data.oneSupports?.length} />}
          >
            <Paragraph>
              {data.oneSupports?.map(x => <LinkTag key={x} to={`/stock/${x}`}>{x}</LinkTag>)}
            </Paragraph>
          </Collapse.Panel>
          <Collapse.Panel
            key="oneResistance"
            header={<>One resistance</>}
            extra={<CounterBadge count={data.oneResistances?.length} />}
          >
            <Paragraph>
              {data.oneResistances?.map(x => <LinkTag key={x} to={`/stock/${x}`}>{x}</LinkTag>)}
            </Paragraph>
          </Collapse.Panel>
        </Collapse>
      </Loading>
    </ContainerStyled>
  );
};

AdminDashboardPage.propTypes = {};

AdminDashboardPage.defaultProps = {};

export default withRouter(AdminDashboardPage);
