import React from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { Typography, Tag, Badge, Select, DatePicker, Table, Input, Button, Space } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { EditOutlined } from '@ant-design/icons';
import { reactLocalStorage } from 'reactjs-localstorage';
import { searchCommissionWithdrawal } from 'services/commissionService';
import UserSelect from 'components/UserSelect';
import MoneyAmount from 'components/MoneyAmount';
import { TimeAgo } from 'components/TimeAgo';
import AdminEditCommissionWithdrawalDrawer from './AdminEditCommissionWithdrawalDrawer';

const { Text } = Typography;

const ContainerStyled = styled.div`
width: 100%;

.ant-alert {
  margin-bottom: 10px;
}

.ant-descriptions-item-container {
  // align-items: center;
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

const StyledTable = styled(Table)`
.ant-table-thead {
  .ant-table-cell {
    vertical-align: top;
  }
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

const DEFAULT_QUERY_INFO = {
  userId: null,
  after: null,
  before: null,
  status: null,
  page: 1,
  size: 50,
};

const LOCAL_STORAGE_KEY = 'commission_withdrawal_query';

const AdminCommissionWithdrawalListPage = () => {

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [queryInfo, setQueryInfo] = React.useState(reactLocalStorage.getObject(LOCAL_STORAGE_KEY, DEFAULT_QUERY_INFO, true))
  const [total, setTotal] = React.useState(0);
  const [current, setCurrent] = React.useState();

  const loadList = async (queryInfo) => {
    try {
      setLoading(true);
      const resp = await searchCommissionWithdrawal(queryInfo);
      const { count, page, data } = resp;
      reactLocalStorage.setObject(LOCAL_STORAGE_KEY, queryInfo);
      ReactDOM.unstable_batchedUpdates(() => {
        setTotal(count);
        setList(data);
        setQueryInfo({ ...queryInfo, page });
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadList(queryInfo);
  }, []);

  const handleStatusChange = status => {
    if (status !== queryInfo.status) {
      loadList({ ...queryInfo, status })
    }
  }

  const handleBeforeChange = (before) => {
    if (before !== queryInfo.before) {
      loadList({ ...queryInfo, before });
    }
  }

  const handleAfterChange = (after) => {
    if (after !== queryInfo.before) {
      loadList({ ...queryInfo, after });
    }
  }

  const handleUserChange = userId => {
    if (userId !== queryInfo.userId) {
      loadList({ ...queryInfo, userId });
    }
  }

  const handleIdChange = e => {
    const id = e.target.value;
    if (id !== queryInfo.id) {
      loadList({ ...queryInfo, id });
    }
  }

  const handleEdit = item => {
    setCurrent(item);
  }

  const handleEditDrawerClose = (changed) => {
    setCurrent(null);
    if (changed) {
      loadList(queryInfo);
    }
  }

  const columns = [
    {
      title: <>
        <div>Status</div>
        <Select
          style={{ width: 120 }}
          defaultValue=""
          placeholder="Status"
          onChange={handleStatusChange}
        >
          <Select.Option value="">All</Select.Option>
          <Select.Option value="submitted">Pending</Select.Option>
          <Select.Option value="done">Done</Select.Option>
          <Select.Option value="rejected">Rejected</Select.Option>
        </Select>
      </>,
      dataIndex: 'status',
      render: (value, item) => {
        switch (value) {
          case 'submitted':
            return <Tag color="processing">Pending</Tag>
          case 'rejected':
            return <Tag color="error">Rejected</Tag>
          case 'done':
            return <Tag color="success">Done</Tag>
          default:
            return 'Unknown'
        }
      }
    },
    {

      title: <>
        <div>Application ID</div>
        <Input maxLength={36} onPressEnter={handleIdChange} onBlur={handleIdChange} allowClear />
      </>,
      dataIndex: 'id',
      render: value => <Text code>{value}</Text>,
    },
    {
      title: <>
        <div>User</div>
        <UserSelect onChange={handleUserChange} />
      </>,
      dataIndex: 'email',
      render: value => <Text code>{value}</Text>
    },
    {
      title: 'Recipient Name',
      render: (value, item) => <>{item.givenName} {item.surname}</>
    },
    {
      title: <>
        <div>Created At</div>
        <Space>
          <DatePicker picker="date" onChange={handleAfterChange} format="D MMM YYYY" />
          -
          <DatePicker picker="date" onChange={handleBeforeChange} format="D MMM YYYY" />
        </Space>
      </>,
      dataIndex: 'createdAt',
      render: (value, item) => <TimeAgo value={value} />
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      fixed: 'right',
      render: (value, item) => <Space size="large" style={{ width: '100%', justifyContent: 'flex-end' }}>
        <MoneyAmount value={value} strong />
        <Button shape="circle" icon={<EditOutlined />} onClick={() => handleEdit(item)} />
      </Space>
    },
  ];

  return (
    <ContainerStyled>
      <StyledTable
        bordered
        size="small"
        loding={loading}
        columns={columns}
        rowKey="id"
        dataSource={list}
        scroll={{
          x: 'max-content'
        }}
        onRow={(item) => {
          return {
            onDoubleClick: () => handleEdit(item)
          }
        }}
        pagination={{
          current: queryInfo.current,
          pageSize: queryInfo.size,
          total: total,
          pageSizeOptions: [20, 50, 100],
          showSizeChanger: true,
          showQuickJumper: true,
          disabled: loading,
          onChange: (page, size) => {
            loadList({ ...queryInfo, page, size });
          },
          onShowSizeChange: (page, size) => {
            loadList({ ...queryInfo, page, size });
          }
        }}
      />
      <AdminEditCommissionWithdrawalDrawer
        value={current}
        onClose={handleEditDrawerClose}
      />
    </ContainerStyled>
  );
};

AdminCommissionWithdrawalListPage.propTypes = {};

AdminCommissionWithdrawalListPage.defaultProps = {};

export default withRouter(AdminCommissionWithdrawalListPage);
