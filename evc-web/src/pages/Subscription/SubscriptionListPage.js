import { Button, Layout, Modal, Space, Typography, Tabs, Row, Col } from 'antd';
import HomeHeader from 'components/HomeHeader';
import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { listTask } from 'services/taskService';
import { listPortfolio } from 'services/portfolioService';
import { PlusOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Divider } from 'antd';
import MyTaskList from 'pages/MyTask/MyTaskList';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import { groupBy } from 'lodash';
import { Empty } from 'antd';
import { Loading } from 'components/Loading';
import { Tooltip } from 'antd';
import { GlobalContext } from 'contexts/GlobalContext';
import ProfileForm from 'pages/Profile/ProfileForm';
import { isProfileComplete } from 'util/isProfileComplete';
import { SearchStockInput } from 'components/SearchStockInput';
import { getStockHistory } from 'services/stockService';
import { subscriptionDef } from 'def/subscriptionDef';
import { SubscriptionCard } from 'components/SubscriptionCard';
import { PaymentCheckout } from 'components/PaymentCheckout';

const { Paragraph } = Typography;


const ContainerStyled = styled.div`
  margin: 6rem auto 2rem auto;
  padding: 0 1rem;
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .ant-divider {
    margin: 8px 0 24px;
  }
`;

const span = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 6,
  xxl: 6
};

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;

  .task-count .ant-badge-count {
    background-color: #389e0d;
    color: #eeeeee;
    // box-shadow: 0 0 0 1px #389e0d inset;
  }
`;

const StyledRow = styled(Row)`
  margin-top: 20px;
`;

const StyledCol = styled(Col)`
  margin-bottom: 20px;
`;

const SubscriptionListPage = (props) => {

  const context = React.useContext(GlobalContext);
  const { user, setUser } = context;
  const [loading, setLoading] = React.useState(true);

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <StyledRow gutter={20}>
          {subscriptionDef.map(s => <StyledCol key={s.key} {...span}>
            <SubscriptionCard
              title={s.title}
              icon={s.icon}
              description={s.description}
              price={s.price}
              period={s.period} />
          </StyledCol>)}
        </StyledRow>
        <div style={{ maxWidth: 400, width: '100%' }}>
          <PaymentCheckout price={0.01} />
        </div>
      </ContainerStyled>

    </LayoutStyled >
  );
};

SubscriptionListPage.propTypes = {};

SubscriptionListPage.defaultProps = {};

export default withRouter(SubscriptionListPage);
