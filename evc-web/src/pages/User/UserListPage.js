import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Table, Input, Modal, Form, Tooltip, Tag, Drawer, Radio } from 'antd';
import {
  DeleteOutlined, SafetyCertificateOutlined, UserAddOutlined, GoogleOutlined, SyncOutlined, QuestionOutlined,
  SearchOutlined,BarChartOutlined,
  UserOutlined,
  ClearOutlined
} from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import { Space, Pagination } from 'antd';
import { searchUsers, deleteUser, setPasswordForUser, setUserTags } from 'services/userService';
import { inviteUser, impersonate } from 'services/authService';
import { TimeAgo } from 'components/TimeAgo';
import { FaTheaterMasks } from 'react-icons/fa';
import { reactLocalStorage } from 'reactjs-localstorage';
import { GlobalContext } from 'contexts/GlobalContext';
import ProfileForm from 'pages/Profile/ProfileForm';
import { BiDollar } from 'react-icons/bi';
import ReferralCreditForm from 'components/ReferralCreditForm';
import { keyBy } from 'lodash';
import { subscriptionDef } from 'def/subscriptionDef';
import HighlightingText from 'components/HighlightingText';
import CheckboxButton from 'components/CheckboxButton';
import TagSelect from 'components/TagSelect';
import { listUserTags, saveUserTag } from 'services/userTagService';
import ReactDOM from 'react-dom';
import TagFilter from 'components/TagFilter';
import { from } from 'rxjs';
import countryList from 'react-select-country-list'
import { getSubscriptionName } from 'util/getSubscriptionName';
import GuestSignUpPanel from './GuestSignUpPanel';

const { Text, Paragraph } = Typography;
const countries = countryList();

const ContainerStyled = styled.div`
`;


const DEFAULT_QUERY_INFO = {
  text: '',
  tags: [],
  page: 1,
  size: 50,
  subscription: [],
  orderField: 'createdAt',
  orderDirection: 'DESC'
};

const LOCAL_STORAGE_KEY = 'user_query';

const UserListPage = () => {

  const [profileModalVisible, setProfileModalVisible] = React.useState(false);
  const [referralCreditModal, setReferralCreditModal] = React.useState(false);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [setPasswordVisible, setSetPasswordVisible] = React.useState(false);
  const [chartVisible, setChartVisible] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState();
  const [list, setList] = React.useState([]);
  const [tags, setTags] = React.useState([]);
  const [inviteVisible, setInviteVisible] = React.useState(false);
  const context = React.useContext(GlobalContext);
  const [queryInfo, setQueryInfo] = React.useState(reactLocalStorage.getObject(LOCAL_STORAGE_KEY, DEFAULT_QUERY_INFO, true))

  const handleTagChange = async (user, tags) => {
    await setUserTags(user.id, tags);
  }

  const columnDef = [
    {
      title: 'Email',
      dataIndex: 'email',
      fixed: 'left',
      render: (text) => <HighlightingText search={queryInfo.text} value={text} />,
    },
    {
      title: 'Client Name',
      dataIndex: 'givenName',
      render: (text, item) => <HighlightingText search={queryInfo.text} value={`${item.givenName || ''} ${item.surname || ''}`} />,
    },
    {
      title: 'Profile Country',
      dataIndex: 'country',
      render: (value) => value ? countries.getLabel(value) : null
    },
    {
      title: 'IP Country',
      dataIndex: 'ipCountry',
      render: (value) => value ? countries.getLabel(value) : null
    },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (text) => text
    },
    {
      title: 'Subscription',
      dataIndex: 'subscription',
      render: (value, item) => item.role === 'admin' ? null : getSubscriptionName(value)
    },
    {
      title: 'Login Type',
      dataIndex: 'loginType',
      render: (text) => text === 'local' ? <Tag color="#333333">Local</Tag> : <Tag icon={<GoogleOutlined />} color="#4c8bf5">Google</Tag>
    },
    {
      title: 'Signed Up',
      dataIndex: 'createdAt',
      render: (text) => <TimeAgo value={text} />,
    },
    {
      title: 'Last Activity',
      dataIndex: 'lastNudgedAt',
      render: (text) => <TimeAgo value={text} />,
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      render: (value, item) => <TagSelect tags={tags} onSave={saveUserTag} value={value} onChange={tags => handleTagChange(item, tags)} />
    },
    {
      // title: 'Action',
      // fixed: 'right',
      // width: 200,
      fixed: 'right',
      render: (text, user) => {
        return (
          <Space size="small" style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Tooltip placement="bottom" title="Referral & credit">
              <Button shape="circle" icon={<BiDollar style={{ position: 'relative', top: 2 }} />}
                disabled={!['member', 'free'].includes(user.role)}
                onClick={e => openReferralCreditModal(e, user)} />
            </Tooltip>
            <Tooltip placement="bottom" title="Update profile">
              <Button shape="circle" icon={<UserOutlined />} onClick={e => openProfileModal(e, user)} />
            </Tooltip>
            <Tooltip placement="bottom" title={user.loginType === 'local' ? 'Set password' : 'Cannot set password for Google SSO'}>
              <Button shape="circle" icon={<SafetyCertificateOutlined />} onClick={e => openSetPasswordModal(e, user)} disabled={user.loginType !== 'local'} />
            </Tooltip>
            <Tooltip placement="bottom" title="Impersonate">
              <Button shape="circle" onClick={e => handleImpersonante(e, user)} disabled={context.user.profile.email === user.email}>
                <FaTheaterMasks style={{ position: 'relative', top: 1 }} size={20} />
              </Button>
            </Tooltip>
            <Tooltip placement="bottom" title="Delete user">
              <Button shape="circle" danger icon={<DeleteOutlined />} onClick={e => handleDelete(e, user)} disabled={user.email === 'admin@easyvaluecheck.com' || context.user.profile.email === user.email} />
            </Tooltip>
          </Space>
        )
      },
    },
  ];

  const loadList = async () => {
    try {
      setLoading(true);
      await searchByQueryInfo(queryInfo)
      const tags = await listUserTags();
      setTags(tags);
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const load$ = from(loadList()).subscribe();

    return () => {
      load$.unsubscribe();
    }
  }, []);

  const handleSearchTextChange = text => {
    const newQueryInfo = {
      ...queryInfo,
      text
    }
    searchByQueryInfo(newQueryInfo);
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

  const searchByQueryInfo = async (queryInfo) => {
    try {
      setLoading(true);
      const resp = await searchUsers(queryInfo);
      const { count, page, data } = resp;
      ReactDOM.unstable_batchedUpdates(() => {
        setTotal(count);
        setList(data);
        setQueryInfo({ ...queryInfo, page });
        setLoading(false);
      });
      reactLocalStorage.setObject(LOCAL_STORAGE_KEY, queryInfo);
    } catch {
      setLoading(false);
    }
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
        await searchByQueryInfo(queryInfo);
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

  const openReferralCreditModal = async (e, user) => {
    e.stopPropagation();
    setCurrentUser(user);
    setReferralCreditModal(true);
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
    const { email, role } = values;
    await inviteUser(email, role);
    setInviteVisible(false);
    loadList();
  }

  const handleTagFilterChange = (tags) => {
    searchByQueryInfo({ ...queryInfo, page: 1, tags });
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
    searchByQueryInfo(newQueryInfo);
  }

  const handleClearFilter = () => {
    searchByQueryInfo(DEFAULT_QUERY_INFO);
  }

  const handlePaginationChange = (page, pageSize) => {
    searchByQueryInfo({ ...queryInfo, page, size: pageSize });
  }

  return (
    <ContainerStyled>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Input.Search
            placeholder="Search name or email"
            enterButton={<SearchOutlined />}
            onSearch={value => handleSearch(value)}
            onPressEnter={e => handleSearch(e.target.value)}
            onChange={e => handleSearchTextChange(e.target.value)}
            loading={loading}
            value={queryInfo?.text}
            allowClear
          />
          <Space>
            <Button danger ghost onClick={() => handleClearFilter()} icon={<ClearOutlined />}>Clear Filter</Button>
            <Button type="primary" ghost onClick={() => setChartVisible(true)} icon={<BarChartOutlined />}></Button>
            <Button type="primary" ghost onClick={() => handleNewUser()} icon={<UserAddOutlined />}></Button>
            <Button type="primary" ghost onClick={() => loadList()} icon={<SyncOutlined />}></Button>
          </Space>
        </Space>
        <Space style={{ marginTop: 16 }}>
          {subscriptionDef.map((x, i) => <CheckboxButton key={i}
            onChange={checked => handleSubscriptionChange(x.key, checked)}
            value={queryInfo.subscription.includes(x.key)}
          >
            {x.title}
          </CheckboxButton>)}
        </Space>
        {tags && <TagFilter value={queryInfo.tags} onChange={handleTagFilterChange} tags={tags} />}
        <Table columns={columnDef}
          bordered
          dataSource={list}
          size="small"
          scroll={{
            x: 'max-content'
          }}
          // scroll={{x: 1000}}
          rowKey="id"
          loading={loading}
          pagination={{
            current: queryInfo.current,
            pageSize: queryInfo.size,
            total: total,
            showTotal: total => `Total ${total}`,
            pageSizeOptions: [10, 30, 60],
            showSizeChanger: true,
            showQuickJumper: true,
            disabled: loading,
            onChange: handlePaginationChange,
            onShowSizeChange: (page, size) => {
              searchByQueryInfo({ ...queryInfo, page, size });
            }

          }}
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
        <Form layout="vertical" onFinish={handleInviteUser} initialValues={{ role: 'free' }}>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', whitespace: true, max: 100, message: ' ' }]}>
            <Input placeholder="abc@xyz.com" type="email" autoComplete="email" allowClear={true} maxLength="100" autoFocus={true} />
          </Form.Item>
          <Form.Item label="Role" name="role">
            <Radio.Group defaultValue="free" disabled={loading} optionType="button" buttonStyle="solid">
              <Radio.Button value="free">Client</Radio.Button>
              <Radio.Button value="admin">Admin</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Tags" name="tags">
            <TagSelect tags={tags} onSave={saveUserTag} />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit" disabled={loading}>Invite</Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        visible={chartVisible}
        placement="bottom"
        width={700}
        // height="calc(100% - 100px)"
        destroyOnClose={true}
        maskClosable={true}
        closable
        title="Guest / New Sign Up"
        onOk={() => setChartVisible(false)}
        onCancel={() => setChartVisible(false)}
        footer={null}
      >
        <GuestSignUpPanel />
      </Modal>
      <Drawer
        visible={profileModalVisible}
        destroyOnClose={true}
        maskClosable={true}
        title="Update Profile"
        onClose={() => setProfileModalVisible(false)}
        footer={null}
        width={400}
      >
        {/* <Alert style={{ marginBottom: '0.5rem' }} type="warning" showIcon message="Changing email will change the login account. After changing, system will send out a new invitation to the new email address to reset your password." /> */}

        {currentUser && <ProfileForm user={currentUser} onOk={() => setProfileModalVisible(false)} refreshAfterLocaleChange={false} />}
      </Drawer>
      <Drawer
        visible={referralCreditModal}
        destroyOnClose={true}
        maskClosable={true}
        title="Referral & Credit"
        onClose={() => setReferralCreditModal(false)}
        width={400}
      >
        {currentUser && <Space size="large" direction="vertical" style={{ width: '100%', alignItems: 'center' }}>
          <Text code>{currentUser.email}</Text>
          <ReferralCreditForm user={currentUser} onOk={() => {
            setProfileModalVisible(false);
            loadList();
          }} />

        </Space>}
      </Drawer>
    </ContainerStyled>

  );
};

UserListPage.propTypes = {};

UserListPage.defaultProps = {};

export default withRouter(UserListPage);
