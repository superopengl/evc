import React from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { Typography, Collapse, Tag, Badge, List, Button } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { Loading } from 'components/Loading';
import { getDashboard } from 'services/dashboardService';
import { CaretRightOutlined, DeleteOutlined } from '@ant-design/icons';
import { from } from 'rxjs';
import { deleteStockPlea } from 'services/stockService';
import { ConfirmDeleteButton } from 'pages/Stock/ConfirmDeleteButton';

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

const StyledStockPleaList = styled(List)`
.ant-list-item {
  border: 0;
  padding-left: 0;
  padding-right: 0;
}
`;

const CounterBadge = (props) => {
  const count = props.count || 0;
  const backgroundColor = count ? (props.color || '#d7183f') : '#AFAFAF';
  return <Badge overflowCount={9999} count={count} showZero style={{ backgroundColor }} />
}

const LinkTag = props => {
  return <Link to={props.to}>
    <StyledTag>{props.children}</StyledTag>
  </Link>
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
          defaultActiveKey={['plea']}
          accordion
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        >
          <Collapse.Panel
            key="plea"
            header={<>Unsupported Stock Requests </>}
            extra={<CounterBadge count={data.pleas?.length} color="#55B0D4" />}
          >
            <StyledStockPleaList
              loading={loading}
              size="small"
              bordered={false}
              dataSource={data.pleas}
              renderItem={item => <List.Item 
              actions={[
                <ConfirmDeleteButton type="link" danger to={`/stock?create=${item.symbol}`} 
                message={<>Delete stock request <strong>{item.symbol}</strong>?</>}
                icon={<DeleteOutlined />} 
                onOk={() => handleDeleteStockPlea(item.symbol)}
                />
              ]}
              >
                <strong>{item.symbol}</strong> has {item.count} requests. <Link to={`/stock?create=${item.symbol}`}>Click to create</Link>
              </List.Item>}
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
