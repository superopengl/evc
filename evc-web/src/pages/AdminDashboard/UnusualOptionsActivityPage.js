import React from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { Typography, Tabs, Tag, Badge } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { Loading } from 'components/Loading';
import { getDashboard } from 'services/dashboardService';
import { CaretRightOutlined } from '@ant-design/icons';

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

const UnusualOptionsActivityPage = () => {

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
    loadList();
  }, []);

  return (
    <ContainerStyled>
      <Loading loading={loading} >
        <Tabs defaultActiveKey="stocks" type="card">
          <Tabs.TabPane tab="Stocks" key="stocks">

          </Tabs.TabPane>
          <Tabs.TabPane tab="ETFS" key="etfs">

          </Tabs.TabPane>
          <Tabs.TabPane tab="Indices" key="indices">

          </Tabs.TabPane>
        </Tabs>
      </Loading>
    </ContainerStyled>
  );
};

UnusualOptionsActivityPage.propTypes = {};

UnusualOptionsActivityPage.defaultProps = {};

export default withRouter(UnusualOptionsActivityPage);
