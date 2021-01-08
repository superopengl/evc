import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Button, Table, Input, Modal, Form, Tooltip, Tag, Drawer, Divider } from 'antd';
import HomeHeader from 'components/HomeHeader';
import {
  DeleteOutlined, SafetyCertificateOutlined, UserAddOutlined, GoogleOutlined, SyncOutlined, QuestionOutlined,
  IdcardOutlined, SearchOutlined,
  UserOutlined
} from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import { Space, Alert } from 'antd';
import { listAllUsers, deleteUser, setPasswordForUser } from 'services/userService';
import { inviteUser, impersonate } from 'services/authService';
import { TimeAgo } from 'components/TimeAgo';
import { FaTheaterMasks } from 'react-icons/fa';
import { reactLocalStorage } from 'reactjs-localstorage';
import { GlobalContext } from 'contexts/GlobalContext';
import PortfolioList from 'pages/Portfolio/PortfolioList';
import ProfileForm from 'pages/Profile/ProfileForm';
import { BiDollar } from 'react-icons/bi';
import ReferralBalanceForm from 'components/ReferralBalanceForm';
import * as _ from 'lodash';
import { subscriptionDef } from 'def/subscriptionDef';
import Highlighter from "react-highlight-words";
import HighlightingText from 'components/HighlightingText';
import CheckboxButton from 'components/CheckboxButton';


const { Title, Text, Paragraph } = Typography;

const ContainerStyled = styled.div`
  margin: 6rem 1rem 2rem 1rem;
`;

const StyledTitleRow = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 width: 100%;
`

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;

const subscriptionDefMap = _.keyBy(subscriptionDef, 'key');

const DEFAULT_QUERY_INFO = {
  text: '',
  page: 1,
  size: 50,
  subscription: [],
  orderField: 'createdAt',
  orderDirection: 'DESC'
};

const LOCAL_STORAGE_KEY = 'user_query';

const UserListPage = () => {

  const [profileModalVisible, setProfileModalVisible] = React.useState(false);
  const [portfolioModalVisible, setPortfolioModalVisible] = React.useState(false);
  const [referralBalanceModal, setReferralBalanceModal] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [setPasswordVisible, setSetPasswordVisible] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState();
  const [list, setList] = React.useState([]);
  const [inviteVisible, setInviteVisible] = React.useState(false);
  const context = React.useContext(GlobalContext);
  const [queryInfo, setQueryInfo] = React.useState(reactLocalStorage.getObject(LOCAL_STORAGE_KEY, DEFAULT_QUERY_INFO, true))

  const columnDef = [
    {
      title: 'Email',
      dataIndex: 'email',
      render: (text) => <HighlightingText search={queryInfo.text} value={text} />,
    },
    {
      title: 'Given Name',
      dataIndex: 'givenName',
      render: (text) => <HighlightingText search={queryInfo.text} value={text} />,
    },
    {
      title: 'Surname',
      dataIndex: 'surname',
      render: (text) => <HighlightingText search={queryInfo.text} value={text} />,
    },
    {
      title: 'Subscription',
      dataIndex: 'subscriptionType',
      render: (value) => subscriptionDefMap[value]?.title
    },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (text) => text
    },
    {
      title: 'Login Type',
      dataIndex: 'loginType',
      render: (text) => text === 'local' ? <Tag color="#333333">Local</Tag> : <Tag icon={<GoogleOutlined />} color="#4c8bf5">Google</Tag>
    },
    {
      title: 'Last Logged In At',
      dataIndex: 'lastLoggedInAt',
      render: (text) => <TimeAgo value={text} />,
    },
    {
      // title: 'Action',
      // fixed: 'right',
      // width: 200,
      render: (text, user) => {
        return (
          <Space size="small" style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Tooltip placement="bottom" title="Referral & balance">
              <Button shape="circle" icon={<BiDollar style={{ position: 'relative', top: 2 }} />}
                disabled={user.role !== 'client'}
                onClick={e => openReferralBalanceModal(e, user)} />
            </Tooltip>
            <Tooltip placement="bottom" title="Update profile">
              <Button shape="circle" icon={<UserOutlined />} onClick={e => openProfileModal(e, user)} />
            </Tooltip>
            <Tooltip placement="bottom" title="Set password">
              <Button shape="circle" icon={<SafetyCertificateOutlined />} onClick={e => openSetPasswordModal(e, user)} />
            </Tooltip>
            <Tooltip placement="bottom" title="Impersonate">
              <Button shape="circle" onClick={e => handleImpersonante(e, user)} disabled={context.user.profile.email === user.email}>
                <FaTheaterMasks style={{ position: 'relative', top: 1 }} size={20} />
              </Button>
            </Tooltip>
            <Tooltip placement="bottom" title="Delete user">
              <Button shape="circle" danger icon={<DeleteOutlined />} onClick={e => handleDelete(e, user)} disabled={user.email === 'admin@easyvaluecheck.com'} />
            </Tooltip>
          </Space>
        )
      },
    },
  ];

  const loadList = async (qi = queryInfo) => {
    try {
      setLoading(true);
      const list = await listAllUsers(qi);
      setList(list);
      updateQueryInfo(qi);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadList();
  }, []);

  const updateQueryInfo = (queryInfo) => {
    reactLocalStorage.setObject(LOCAL_STORAGE_KEY, queryInfo);
    setQueryInfo(queryInfo);
  }

  const handleSearchTextChange = text => {
    const newQueryInfo = {
      ...queryInfo,
      text
    }
    updateQueryInfo(newQueryInfo);
    // await loadTaskWithQuery(newQueryInfo);
  }

  const handleSearch = async (value) => {
    const text = value?.trim();

    const newQueryInfo = {
      ...queryInfo,
      text
    }

    await loadList(newQueryInfo);
  }

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    const { id, email } = item;
    Modal.confirm({
      title: <>Delete user</>,
      content: <>Delete user <Text code>{email}</Text>?</>,
      onOk: async () => {
        setLoading(true);
        await deleteUser(id);
        await loadList();
        setLoading(false);
      },
      maskClosable: true,
      okButtonProps: {
        danger: true
      },
      okText: 'Yes, delete it!'
    });
  }

  const handleImpersonante = async (e, item) => {
    e.stopPropagation();
    // setSetPasswordVisible(true);
    // setCurrentUser(item);
    Modal.confirm({
      title: 'Impersonate',
      icon: <QuestionOutlined />,
      content: <>To impersonate user <Text code>{item.email}</Text></>,
      okText: 'Yes, impersonate',
      maskClosable: true,
      onOk: async () => {
        await impersonate(item.email);
        reactLocalStorage.clear();
        window.location = '/';
      }
    })
  }


  const openReferralBalanceModal = async (e, user) => {
    e.stopPropagation();
    setCurrentUser(user);
    setReferralBalanceModal(true);
  }

  const openSetPasswordModal = async (e, user) => {
    e.stopPropagation();
    setSetPasswordVisible(true);
    setCurrentUser(user);
  }

  const openProfileModal = async (e, user) => {
    e.stopPropagation();
    setProfileModalVisible(true);
    setCurrentUser(user);
  }

  const handleSetPassword = async (id, values) => {
    setLoading(true);
    await setPasswordForUser(id, values.password);
    setSetPasswordVisible(false);
    setCurrentUser(undefined);
    setLoading(false);
  }

  const handleNewUser = () => {
    setInviteVisible(true);
  }

  const handleInviteUser = async values => {
    const { email } = values;
    await inviteUser(email);
    setInviteVisible(false);
    loadList();
  }

  const handleSubscriptionChange = (type, checked) => {
    let subscription = [...queryInfo.subscription];
    if (checked) {
      subscription.push(type);
    } else {
      subscription = subscription.filter(x => x !== type);
    }
    const newQueryInfo = {
      ...queryInfo,
      subscription
    }
    loadList(newQueryInfo);
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>User Management</Title>
          </StyledTitleRow>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Input.Search
              placeholder="Input search text"
              enterButton={<SearchOutlined />}
              onSearch={value => handleSearch(value)}
              onPressEnter={e => handleSearch(e.target.value)}
              onChange={e => handleSearchTextChange(e.target.value)}
              loading={loading}
              value={queryInfo?.text}
              allowClear
            />

            <Space>
              {subscriptionDef.map((x, i) => <CheckboxButton key={i} value={x.key}
                onChange={checked => handleSubscriptionChange(x.key, checked)}
                value={queryInfo.subscription.includes(x.key)}
              >
                {x.title}
              </CheckboxButton>)}
            </Space>
            <Button type="primary" ghost onClick={() => handleNewUser()} icon={<UserAddOutlined />}></Button>
            <Button type="primary" ghost onClick={() => loadList()} icon={<SyncOutlined />}></Button>
          </Space>
          <Table columns={columnDef}
            dataSource={list}
            size="small"

            // scroll={{x: 1000}}
            rowKey="id"
            loading={loading}
            pagination={queryInfo}
          // pagination={queryInfo}
          // onChange={handleTableChange}
          // onRow={(record, index) => ({
          //   onDoubleClick: e => {
          //     setCurrentId(record.id);
          //     setFormVisible(true);
          //   }
          // })}
          />
        </Space>
      </ContainerStyled>
      <Modal
        visible={setPasswordVisible}
        destroyOnClose={true}
        maskClosable={false}
        onOk={() => setSetPasswordVisible(false)}
        onCancel={() => setSetPasswordVisible(false)}
        title={<>Reset Password</>}
        footer={null}
        width={400}
      >
        <Form layout="vertical" onFinish={values => handleSetPassword(currentUser?.id, values)}>
          <Space style={{ justifyContent: 'center', width: '100%' }}>
            <Paragraph code>{currentUser?.email}</Paragraph>
          </Space>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: ' ' }]}>
            <Input placeholder="New password" autoFocus autoComplete="new-password" disabled={loading} />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit" disabled={loading}>Reset Password</Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        visible={inviteVisible}
        destroyOnClose={true}
        maskClosable={false}
        onOk={() => setInviteVisible(false)}
        onCancel={() => setInviteVisible(false)}
        title={<>Invite User</>}
        footer={null}
        width={500}
      >
        <Paragraph>System will send an invitation to the email address if the email address hasn't signed up before.</Paragraph>
        <Form layout="vertical" onFinish={handleInviteUser}>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', whitespace: true, max: 100, message: ' ' }]}>
            <Input placeholder="abc@xyz.com" type="email" autoComplete="email" allowClear={true} maxLength="100" autoFocus={true} />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit" disabled={loading}>Invite</Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        visible={portfolioModalVisible}
        destroyOnClose={true}
        maskClosable={false}
        closable={true}
        onOk={() => setPortfolioModalVisible(false)}
        onCancel={() => setPortfolioModalVisible(false)}
        title={<>Portoflios for <Text code>{currentUser?.email}</Text></>}
        footer={null}
        width={600}
      >
        {currentUser && <PortfolioList userId={currentUser.id} />}
      </Modal>
      <Modal
        visible={profileModalVisible}
        destroyOnClose={true}
        maskClosable={false}
        title="Update Profile"
        onOk={() => setProfileModalVisible(false)}
        onCancel={() => setProfileModalVisible(false)}
        footer={null}
      >
        {/* <Alert style={{ marginBottom: '0.5rem' }} type="warning" showIcon message="Changing email will change the login account. After changing, system will send out a new invitation to the new email address to reset your password." /> */}

        {currentUser && <ProfileForm user={currentUser} onOk={() => setProfileModalVisible(false)} />}
      </Modal>
      <Drawer
        visible={referralBalanceModal}
        destroyOnClose={true}
        maskClosable={true}
        title="Referral & Balance"
        onClose={() => setReferralBalanceModal(false)}
        width={400}
      >
        {currentUser && <Space size="large" direction="vertical" style={{ width: '100%', alignItems: 'center' }}>
          <Text code>{currentUser.email}</Text>
          <ReferralBalanceForm user={currentUser} onOk={() => setProfileModalVisible(false)} />

        </Space>}
      </Drawer>
    </LayoutStyled >

  );
};

UserListPage.propTypes = {};

UserListPage.defaultProps = {};

export default withRouter(UserListPage);
