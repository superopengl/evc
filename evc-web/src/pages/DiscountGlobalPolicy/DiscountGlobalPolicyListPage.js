import React from 'react';
import styled from 'styled-components';
import { Button, Drawer, Table, Tooltip, Modal, Input, Typography } from 'antd';
import Text from 'antd/lib/typography/Text';
import {
  StopOutlined, PlusOutlined, RocketOutlined, CopyOutlined
} from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import { Space } from 'antd';

import { TimeAgo } from 'components/TimeAgo';
import MoneyAmount from 'components/MoneyAmount';
import { enableDiscountGlobalPolicy, listDiscountGlobalPolicies, saveDiscountGlobalPolicy } from 'services/discountPolicyService';
import { Form } from 'antd';
import { InputNumber } from 'antd';
import { DatePicker } from 'antd';
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment';
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { from } from 'rxjs';
import { FormattedMessage } from 'react-intl';

const { Title } = Typography;
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const ContainerStyled = styled.div`
  .active-referral {
    background-color: rgba(87,187,96, 0.1);
  }

  .rbc-event {
    background: repeating-linear-gradient(
      165deg,
      #57BB60,
      #57BB60 10px,
      #3e9448 10px,
      #3e9448 20px
    );

    font-weight: 600;
  }

`;


const DiscountGlobalPolicyListPage = () => {

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);
  const [newPolicy, setNewPolicy] = React.useState();

  const columnDef = [
    {
      title: '% per referral',
      dataIndex: 'percentage',
      align: 'left',
      render: (value) => <>{+value * 100} %</>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      render: (value) => value
    },
    {
      title: 'Start',
      dataIndex: 'start',
      render: (value) => <TimeAgo value={value} accurate={false} />,
    },
    {
      title: 'End',
      dataIndex: 'end',
      render: (value) => <TimeAgo value={value} accurate={false} />
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
      const list = await listDiscountGlobalPolicies();
      setList(list);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const load$ = from(loadList()).subscribe();
    return () => {
      load$.unsubscribe();
    }
  }, []);

  const setReferralGolbalPolicyEnabled = async (policyId, toEnable) => {
    try {
      setLoading(true);
      await enableDiscountGlobalPolicy(policyId, toEnable);
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
    const { percentage, start, end, description } = copyPolicy;
    setNewPolicy({
      percentage,
      range: [moment(start), moment(end)],
      description,
      active: false,
    });
  }

  const handleSave = async (values) => {
    const { percentage, range, description } = values;
    const policy = {
      percentage,
      start: range[0],
      end: range[1],
      description
    }
    try {
      setLoading(true);
      await saveDiscountGlobalPolicy(policy);
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
    const { percentage, start, end, description, active } = event;
    setNewPolicy({
      percentage,
      range: [moment(start), moment(end)],
      description,
      active,
    })
  }

  const calendarEvents = list.map((a, i) => ({
    id: i,
    title: `${a.description}${a.active ? ' Active' : ''}`,
    start: moment(a.start).toDate(),
    end: moment(a.end).toDate(),
    allDay: true
  }));

  return (
    <ContainerStyled>
      <Space direction="vertical" style={{ width: '100%' }} size="large">

        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Title level={3}>
          <FormattedMessage id="menu.globalDiscountPolicy" />
        </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleCreateNew()}>New Discount Policy</Button>
        </Space>

        <div className="calendar-container">
          <DnDCalendar
            localizer={localizer}
            events={calendarEvents}
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
        title="New Global Discount Policy"
        visible={newPolicy}
        destroyOnClose={true}
        closable={true}
        maskClosable={true}
        width={400}
        onClose={() => setNewPolicy()}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleSave} initialValues={newPolicy}>
          <Form.Item label="Discount % per referral" name="percentage" rules={[{ required: true, type: 'number', min: 0.01, max: 0.99, message: ' ' }]}>
            <InputNumber
              min={0.01}
              max={0.99}
              step={0.05}
              formatter={value => `${value * 100} %`}
              parser={value => +(value.replace(' %', '')) / 100}
            />
          </Form.Item>
          <Form.Item label="Time Range" name="range" rules={[{ required: true, message: ' ' }]}>
            <DatePicker.RangePicker />
          </Form.Item>
          <Form.Item label="Description" name="description" rules={[{ required: true, whitespace: true, max: 1000 }]}>
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

DiscountGlobalPolicyListPage.propTypes = {};

DiscountGlobalPolicyListPage.defaultProps = {};

export default withRouter(DiscountGlobalPolicyListPage);
