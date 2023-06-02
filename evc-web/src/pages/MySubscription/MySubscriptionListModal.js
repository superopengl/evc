import { Button, Layout, Modal, Space, Typography, Table, Row, Col } from 'antd';
import HomeHeader from 'components/HomeHeader';
import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { listTask } from 'services/taskService';
import { listPortfolio } from 'services/portfolioService';
import { CopyOutlined, PlusOutlined, WarningOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Divider } from 'antd';
import MyTaskList from 'pages/MyTask/MyTaskList';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import { groupBy } from 'lodash';
import { Empty, List } from 'antd';
import { Loading } from 'components/Loading';
import { Tooltip } from 'antd';
import { GlobalContext } from 'contexts/GlobalContext';
import ProfileForm from 'pages/Profile/ProfileForm';
import { isProfileComplete } from 'util/isProfileComplete';
import { StockSearchInput } from 'components/StockSearchInput';
import { getStockHistory } from 'services/stockService';
import { subscriptionDef } from 'def/subscriptionDef';
import { SubscriptionCard } from 'components/SubscriptionCard';
import { PayPalCheckoutButton } from 'components/PayPalCheckoutButton';
import { getSubscriptionName } from 'util/getSubscriptionName';
import { Alert } from 'antd';
import PaymentModal from 'components/PaymentModal';
import { StockName } from 'components/StockName';
import { getMyAccount } from 'services/accountService';
import MoneyAmount from 'components/MoneyAmount';
import ReferralLinkInput from 'components/ReferralLinkInput';
import { listMySubscriptionHistory } from 'services/subscriptionService';
import { TimeAgo } from 'components/TimeAgo';
import PropTypes from 'prop-types';

const { Paragraph, Text, Title, Link: LinkText } = Typography;


const ContainerStyled = styled.div`
  margin: 6rem auto 2rem auto;
  padding: 0 1rem 4rem;
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  align-items: center;

  // .ant-divider {
  //   margin: 20px 0 8px;
  // }
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
    background-color: #15be53;
    color: #eeeeee;
    // box-shadow: 0 0 0 1px #15be53 inset;
  }
`;

const StyledRow = styled(Row)`
  margin-top: 20px;
`;

const StyledCol = styled(Col)`
  margin-bottom: 20px;
`;

const MySubscriptionListModal = (props) => {

  
  const {visible} = props;
  const [loading, setLoading] = React.useState(true);
  const [modalVisible, setModalVisible] = React.useState(visible);
  const [list, setList] = React.useState([]);

  const loadSubscrptions = async () => {
    try {
      setLoading(true);

      const account = await listMySubscriptionHistory();
      setList(account);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadSubscrptions();
  }, []);

  React.useEffect(() => {
    setModalVisible(visible);
  }, [visible]);

  const handleClose = () => {
    setModalVisible(false);
    props.onOk();
  }


  const columnDef = [
    {
      title: 'Type',
      dataIndex: 'type',
      render: (value, item) => value
    },
    {
      title: 'Start',
      dataIndex: 'start',
      render: (value, item) => <TimeAgo value={value}/>
    },
    {
      title: 'End',
      dataIndex: 'end',
      render: (value, item) => <TimeAgo value={value}/>
    },
    {
      title: 'Recurring',
      dataIndex: 'recurring',
      render: (value, item) => value
    },
    {
      title: 'Symbols',
      dataIndex: 'symbols',
      render: (value, item) => value
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (value, item) => value
    }
  ];


  return (
    <Modal
      visible={modalVisible}
      onOk={() => handleClose()}
      onCancel={() => handleClose()}
      footer={null}
      title="All Subscriptions"
      closable={true}
      maskClosable={true}
      destroyOnClose={true}
      width="90%"
    >
      <Table
        loading={loading}
        dataSource={list}
        columns={columnDef}
        size="small"
        pagination={false}
        rowKey="id"
      />
    </Modal>
  );
};

MySubscriptionListModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onOk: PropTypes.func,
};

MySubscriptionListModal.defaultProps = {
  visible: false,
};

export default withRouter(MySubscriptionListModal);
