import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Button, Drawer, Table, Tooltip, Modal, Input } from 'antd';
import Text from 'antd/lib/typography/Text';
import {
  StopOutlined, PlusOutlined, RocketOutlined, CopyOutlined
} from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import { Space } from 'antd';

import { TimeAgo } from 'components/TimeAgo';
import MoneyAmount from 'components/MoneyAmount';
import { enableReferralGlobalPolicy, listReferalGlobalPolicies, saveReferralGlobalPolicy } from 'services/referralPolicyService';
import { Form } from 'antd';
import { InputNumber } from 'antd';
import { DatePicker } from 'antd';
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment';
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const { Title } = Typography;

const ContainerStyled = styled.div`
  .active-referral {
    background-color: rgba(87,187,96, 0.1);
  }
`;

const StyledTitleRow = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 width: 100%;
`


const ReferralGlobalPolicyListPage = () => {

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);
  const [newPolicy, setNewPolicy] = React.useState();

  const columnDef = [
    {
      title: 'Amount per Referral',
      dataIndex: 'amount',
      render: (value) => <MoneyAmount value={value} />
    },
    {
      title: 'Description',
      dataIndex: 'description',
      render: (value) => value
    },
    {
      title: 'Start',
      dataIndex: 'start',
      render: (value) => <TimeAgo value={value} accurate={true} />,
    },
    {
      title: 'End',
      dataIndex: 'end',
      render: (value) => <TimeAgo value={value} accurate={true} />
    },
    {
      title: 'Active',
      dataIndex: 'active',
      render: (value) => <Text strong={value}>{value ? 'Active' : ''}</Text>,
    },
    // {
    //   title: 'Created At',
    //   render: (value) => <TimeAgo value={value} accurate={false} />
    // },
    {
      // title: 'Action',
      // fixed: 'right',
      // width: 200,
      render: (text, item) => {
        const { active } = item;
        return (
          <Space size="small" style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Tooltip placement="bottom" title="Clone policy">
              <Button shape="circle" icon={<CopyOutlined />} onClick={() => handleClonePolicy(item)} />
            </Tooltip>
            {active && <Tooltip placement="bottom" title="Disable policy">
              <Button shape="circle" danger icon={<StopOutlined />} onClick={() => handleEnablePolicy(item, false)} />
            </Tooltip>}
            {!active && <Tooltip placement="bottom" title="Use this policy">
              <Button shape="circle" icon={<RocketOutlined />} onClick={() => handleEnablePolicy(item, true)} />
            </Tooltip>}
          </Space>
        )
      },
    },
  ];

  const loadList = async () => {
    try {
      setLoading(true);
      const list = await listReferalGlobalPolicies();
      setList(list.map((a, i) => ({
        id: i,
        title: `$${a.amount.toFixed(2)} ${a.description}`,
        start: moment(a.start).toDate(),
        end: moment(a.end).toDate(),
        allDay: true
      })));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadList();
  }, []);

  const setReferralGolbalPolicyEnabled = async (policyId, toEnable) => {
    try {
      setLoading(true);
      await enableReferralGlobalPolicy(policyId, toEnable);
      await loadList();
    } finally {
      setLoading(false);
    }
  }

  const handleEnablePolicy = (policy, toEnable) => {
    if (toEnable) {
      Modal.confirm({
        title: <>Change to use this policy as the active global policy?</>,
        onOk: () => setReferralGolbalPolicyEnabled(policy.id, toEnable),
        maskClosable: true,
        okText: 'Yes, use this'
      });
    } else {
      setReferralGolbalPolicyEnabled(policy.id, toEnable);
    }
  }

  const handleCreateNew = async () => {
    setNewPolicy({});
  }

  const handleClonePolicy = (copyPolicy) => {
    const { amount, start, end, description } = copyPolicy;
    setNewPolicy({
      amount,
      range: [moment(start), moment(end)],
      description,
      active: false,
    });
  }

  const handleSave = async (values) => {
    const { amount, range, description } = values;
    const policy = {
      amount,
      start: range[0],
      end: range[1],
      description
    }
    try {
      setLoading(true);
      await saveReferralGlobalPolicy(policy);
      setNewPolicy();
      await loadList();
    } finally {
      setLoading(false);
    }
  }

  const onEventResize = (data) => {
    const { start, end, event } = data;
    event.start = start;
    event.end = end;
    setList([...list]);
  };

  const onEventDrop = (data) => {
    console.log(data);
  };

  const handleSelectEvent = (event) => {
    const {amount, start, end, description, active} = event;
    setNewPolicy({
      amount,
      range: [moment(start), moment(end)],
      description,
      active,
    })
  }

  return (
      <ContainerStyled>
        <Space direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Global Referral Policy</Title>
          </StyledTitleRow>

          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button type="primary" ghost icon={<PlusOutlined />} onClick={() => handleCreateNew()}>New Policy</Button>
          </Space>

          <div>
            <DnDCalendar
              localizer={localizer}
              events={list}
              defaultView="month"
              views={['month']}
              defaultDate={moment().toDate()}
              startAccessor="start"
              endAccessor="end"
              onEventDrop={onEventDrop}
              onEventResize={onEventResize}
              onSelectEvent={handleSelectEvent}
              resizable
              style={{ height: "100vh", maxHeight: 700 }}
            />
          </div>
          <Table columns={columnDef}
            dataSource={list}
            size="small"
            // scroll={{x: 1000}}
            rowKey="id"
            loading={loading}
            pagination={false}
            onRow={row => {
              return {
                className: row.active ? 'active-referral' : ''
              }
            }}
          // pagination={queryInfo}
          // onChange={handleTableChange}
          />
        </Space>

      <Drawer
        title="New Global Referral Policy"
        visible={newPolicy}
        destroyOnClose={true}
        closable={true}
        maskClosable={true}
        width={400}
        onClose={() => setNewPolicy()}
        footer={null}
        >
        <Form layout="vertical" onFinish={handleSave} initialValues={newPolicy}>
          <Form.Item label="Amount per Referral" name="amount" rules={[{ required: true, type: 'number', min: 0, message: ' ' }]}>
            <InputNumber />
          </Form.Item>
          <Form.Item label="Time Range" name="range" rules={[{ required: true, message: ' ' }]}>
            <DatePicker.RangePicker />
          </Form.Item>
          <Form.Item label="Description" name="description" rules={[{ required: false, whitespace: true, max: 1000 }]}>
            <Input.TextArea maxLength={1000} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" block htmlType="submit">Create</Button>
          </Form.Item>
          <Form.Item>
            <Button type="primary" danger block>Disable</Button>
          </Form.Item>
        </Form>
      </Drawer>
        </ContainerStyled>

  );
};

ReferralGlobalPolicyListPage.propTypes = {};

ReferralGlobalPolicyListPage.defaultProps = {};

export default withRouter(ReferralGlobalPolicyListPage);
