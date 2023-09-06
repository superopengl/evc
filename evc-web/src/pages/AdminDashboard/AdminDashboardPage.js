import React from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { Typography, Layout, Tag, Badge, Tabs } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { Loading } from 'components/Loading';
import { getDashboard } from 'services/dashboardService';

const { Paragraph } = Typography;

const ContainerStyled = styled.div`
width: 100%;

.ant-alert {
  margin-bottom: 10px;
}
`;


const StyledTag = styled(Tag)`
margin-bottom: 8px;
font-size: 1rem;

&:hover {
  color: #18b0d7;
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
    <StyledTag>{props.children}</StyledTag>
  </Link>
}

const AdminDashboardPage = () => {

  const [data, setData] = React.useState([]);
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
    loadList();
  }, []);

  return (
      <ContainerStyled>
        <Loading loading={loading}>
          <Tabs type="card">
            <Tabs.TabPane
              key="plea"
              tab={<>Unsupported Stock Requests <CounterBadge count={data.pleas?.length} color="#18b0d7" /></>}
            >
              {data.pleas?.map(x => <Paragraph key={x.symbol}>
                <strong>{x.symbol}</strong> has {x.count} requests. <Link to={`/stock?create=${x.symbol}`}>Click to create</Link>
              </Paragraph>)}
            </Tabs.TabPane>
            <Tabs.TabPane
              key="invalidEps"
              tab={<>No fair value (invalid EPS) <CounterBadge count={data.noFairValuesByInvalidTtmEps?.length} /></>}
            >
              <Paragraph>
                {data.noFairValuesByInvalidTtmEps?.map(x => <LinkTag key={x} to={`/stock/${x}`}>{x}</LinkTag>)}
              </Paragraph>
            </Tabs.TabPane>
            <Tabs.TabPane
              key="noEps"
              tab={<>No fair value (no EPS data) <CounterBadge count={data.noFairValuesByMissingEpsData?.length} /></>}
            >
              <Paragraph>
                {data.noFairValuesByMissingEpsData?.map(x => <LinkTag key={x} to={`/stock/${x}`}>{x}</LinkTag>)}
              </Paragraph>
            </Tabs.TabPane>
            <Tabs.TabPane
              key="noSupport"
              tab={<>No support <CounterBadge count={data.noSupports?.length} /></>}
            >
              <Paragraph>
                {data.noSupports?.map(x => <LinkTag key={x} to={`/stock/${x}`}>{x}</LinkTag>)}
              </Paragraph>
            </Tabs.TabPane>
            <Tabs.TabPane
              key="noResistance"
              tab={<>No resistance <CounterBadge count={data.noResistances?.length} /></>}
            >
              <Paragraph>
                {data.noResistances?.map(x => <LinkTag key={x} to={`/stock/${x}`}>{x}</LinkTag>)}
              </Paragraph>
            </Tabs.TabPane>
            <Tabs.TabPane
              key="onSupport"
              tab={<>One support <CounterBadge count={data.oneSupports?.length} /></>}
            >
              <Paragraph>
                {data.oneSupports?.map(x => <LinkTag key={x} to={`/stock/${x}`}>{x}</LinkTag>)}
              </Paragraph>
            </Tabs.TabPane>
            <Tabs.TabPane
              key="oneResistance"
              tab={<>One resistance <CounterBadge count={data.oneResistances?.length} /></>}
            >
              <Paragraph>
                {data.oneResistances?.map(x => <LinkTag key={x} to={`/stock/${x}`}>{x}</LinkTag>)}
              </Paragraph>
            </Tabs.TabPane>
          </Tabs>
        </Loading>
      </ContainerStyled>
  );
};

AdminDashboardPage.propTypes = {};

AdminDashboardPage.defaultProps = {};

export default withRouter(AdminDashboardPage);
