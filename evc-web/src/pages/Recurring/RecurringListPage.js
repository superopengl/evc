import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Button, Drawer, Table, Tooltip, Modal, Alert } from 'antd';
import HomeHeader from 'components/HomeHeader';
import * as moment from 'moment';
import Text from 'antd/lib/typography/Text';
import {
  DeleteOutlined, EditOutlined, CaretRightFilled, PlusOutlined
} from '@ant-design/icons';
import { Link, withRouter } from 'react-router-dom';
import { Space } from 'antd';

import { TimeAgo } from 'components/TimeAgo';
import { listRecurring, deleteRecurring, runRecurring, healthCheckRecurring } from 'services/recurringService';
import RecurringForm from './RecurringForm';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import { notify } from 'util/notify';
import cronstrue from 'cronstrue';
import * as cronParser from 'cron-parser';

const { Title, Link: TextLink } = Typography;

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


const StyledDrawer = styled(Drawer)`

.ant-drawer-content-wrapper {
  max-width: 90vw;
}

.rce-mbox {
  padding-bottom: 2rem;

  .rce-mbox-time {
    bottom: -1.5rem;
  }
}
`;

const RecurringListPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [formVisible, setFormVisible] = React.useState(false);
  const [list, setList] = React.useState([]);
  const [currentId, setCurrentId] = React.useState();
  const [healthCheckResult, setHealthCheckResult] = React.useState();

  const isRecurringDeprecated = item => !item.email || !item.taskTemplateId || !item.portfolioName;

  const getNextRunDateString = cron => {
    try {
      const interval = cronParser.parseExpression(cron);
      return interval.next().toString();
    } catch (e) {
      if (/L/.test(cron)) {
        // The last day of month
        const now = moment();
        const lastDayOfMonth = now.endOf('month').format('D');
        const interval = cronParser.parseExpression(cron.replace('L', lastDayOfMonth));
        let dateString = interval.next().toString(); // The run time in current month

        if (moment(dateString).isBefore(now)) {
          // If the time has passed by on the last day of the current month,
          // return the time in the next month.
          dateString = interval.next().toString();
        }
        return dateString;
      }
      throw e;
    }
  }
  const columnDef = [
    {
      title: 'Task Template',
      dataIndex: 'taskTemplateName',
      render: (text, record) => record.taskTemplateName ? <Link to={`/task_template/${record.taskTemplateId}`}>{text}</Link> : <Text type="danger">deleted task template</Text>,
      ellipsis: false
    },
    {
      title: 'Portfolio',
      dataIndex: 'portfolioName',
      onFilter: (value, record) => record.agentId === value,
      render: (text, record) => record.portfolioName ? <>
        <Space>
          <PortfolioAvatar value={text} user={record.portfolioId} size={40} />
          <div direction="vertical" style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
            {text}
            <Text type="secondary"><small>{record.email || <Text type="danger">deleted user</Text>}</small></Text>
          </div>
        </Space>
      </> : <Text type="danger">deleted portfolio</Text>
    },
    {
      title: 'Name Template',
      dataIndex: 'nameTemplate',
      render: (text) => text,
      ellipsis: false
    },
    {
      title: 'Recurring',
      dataIndex: 'cron',
      render: (text) => {
        return cronstrue.toString(text, { use24HourTimeFormat: false, verbose: true });
        // return <TimeAgo value={text} />;
      }
    },
    {
      title: 'Last Update At',
      dataIndex: 'lastUpdatedAt',
      render: (text) => {
        return <TimeAgo value={text} />;
      }
    },
    {
      title: 'Next Run At',
      render: (text, record) => {
        return <TimeAgo value={getNextRunDateString(record.cron)} />;
      }
    },
    {
      title: 'Action',
      // fixed: 'right',
      // width: 200,
      render: (text, record) => {
        const deprecated = isRecurringDeprecated(record);
        return (
          <Space size="small" style={{ width: '100%', justifyContent: 'flex-end' }}>
            {!deprecated && <Tooltip placement="bottom" title="Edit recurring"><Button shape="circle" icon={<EditOutlined />} onClick={e => handleEditRecurring(e, record)} /></Tooltip>}
            {!deprecated && <Tooltip placement="bottom" title="Run immediately"><Button shape="circle" icon={<CaretRightFilled />} onClick={e => handleRunRecurring(e, record)} /></Tooltip>}
            <Tooltip placement="bottom" title="Delete recurring"><Button shape="circle" danger icon={<DeleteOutlined />} onClick={e => handleDelete(e, record)} /></Tooltip>
          </Space>
        )
      },
    },
  ];

  const loadList = async () => {
    setLoading(true);
    const list = await listRecurring();
    setList(list);
    const healthCheckResult = await healthCheckRecurring();
    setHealthCheckResult(healthCheckResult);
    setLoading(false);
  }

  React.useEffect(() => {
    loadList();
  }, []);

  const handleCreateNew = async () => {
    setCurrentId();
    setFormVisible(true);
  }

  const handleEditRecurring = async (e, record) => {
    e.stopPropagation();
    setCurrentId(record.id);
    setFormVisible(true);
  }

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    const { id, taskTemplateName, portfolioName } = item;
    Modal.confirm({
      title: <>Delete Recurring <strong>{taskTemplateName}</strong> for <strong>{portfolioName}</strong>?</>,
      onOk: async () => {
        setLoading(true);
        await deleteRecurring(id);
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

  const handleRunRecurring = async (e, item) => {
    e.stopPropagation();
    const { id } = item;
    const task = await runRecurring(id);
    const notice = notify.success(
      'Successfully run the recurring',
      <Text>The task <TextLink strong onClick={() => {
        notice.close();
        props.history.push(`/tasks/${task.id}/proceed`);
      }}>{task.name}</TextLink> was created</Text>,
      15
    );
  }

  const handleEditOnOk = async () => {
    await loadList();
    setFormVisible(false);
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Recurring Management</Title>
          </StyledTitleRow>

          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            {healthCheckResult && <Alert 
            message={healthCheckResult.error || `Recurring service is healthy. Started at ${moment(healthCheckResult.lock.lockedAt).format('DD MMM YYYY hh:mm A')}`} 
            type={healthCheckResult.error ? 'error' : 'success'} 
            showIcon />}
            <Button type="primary" ghost icon={<PlusOutlined />} onClick={() => handleCreateNew()}>New Recurring</Button>
          </Space>

          <Table columns={columnDef}
            dataSource={list}
            size="small"

            // scroll={{x: 1000}}
            rowKey="id"
            loading={loading}
            pagination={false}
            // pagination={queryInfo}
            // onChange={handleTableChange}
            onRow={(record) => ({
              onDoubleClick: () => {
                setCurrentId(record.id);
                setFormVisible(true);
              }
            })}
          />
        </Space>

      </ContainerStyled>
      <StyledDrawer
        title={currentId ? 'Edit Recurring' : 'New Recurring'}
        placement="right"
        closable={true}
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        destroyOnClose={true}
        width={380}
        // bodyStyle={{ padding: '0 10px' }}
        footer={null}
      >
        <RecurringForm id={currentId} onOk={() => handleEditOnOk()} />
      </StyledDrawer>
    </LayoutStyled >

  );
};

RecurringListPage.propTypes = {};

RecurringListPage.defaultProps = {};

export default withRouter(RecurringListPage);
