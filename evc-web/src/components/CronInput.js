import React from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
import { Tabs, Typography, TimePicker, Space, Select } from 'antd';
import * as moment from 'moment';
import cronstrue from 'cronstrue';
// import 'react-cron-generator/dist/cron-builder.css'

const { Text } = Typography;

const StyledSpace = styled(Space)`
border: 1px solid rgba(217,217,217);
border-radius: 2px;
padding: 11px;
width: 100%;
`;


/**
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, optional)
 */
const pattern = /(.+) (.+) (.+) (.+) (.+) (.+)/;

export const CronInput = props => {
  const { value, onChange } = props;

  const [cron, setCron] = React.useState(value);
  
  const tokens = pattern.exec(cron);
  const monthInfo = tokens[5].split('/');

  const [minute, setMinute] = React.useState(tokens[2]);
  const [hour, setHour] = React.useState(tokens[3]);
  const [dayOfMonth, setDayOfMonth] = React.useState(tokens[4]);
  const [month, setMonth] = React.useState(monthInfo[0]);
  const [everyXMonth, setEveryXMonth] = React.useState(monthInfo[1]);
  const [dayOfWeek, setDayOfWeek] = React.useState(tokens[6]);

  const [defaultPeriod, setDefaultPeriod] = React.useState(tokens[6] !== '*' ? 'weekly' : tokens[5].includes('/') ? 'monthly' : 'yearly');
  const [expression, setExpression] = React.useState('');

  React.useEffect(() => {
    const tokens = pattern.exec(cron);
    const monthInfo = tokens[5].split('/');
    setMinute(tokens[2]);
    setHour(tokens[3]);
    setDayOfMonth(tokens[4]);
    setMonth(monthInfo[0]);
    setEveryXMonth(monthInfo[1])
    setDayOfWeek(tokens[6]);
    
    const defaultPeriod = tokens[6] !== '*' ? 'weekly' : tokens[5].includes('/') ? 'monthly' : 'yearly';
    setDefaultPeriod(defaultPeriod);

    const expression = cronstrue.toString(cron, { use24HourTimeFormat: false, verbose: true });
    setExpression(expression);

    onChange(cron);
  }, [cron])

  const handleEveryXMonthChange = value => {
    if (!value) return;
    setCron(cron.replace(pattern, `$1 $2 $3 $4 */${value} $6`));
  }

  const handleDayOfMonthChange = value => {
    if (!value) return;
    setCron(cron.replace(pattern, `$1 $2 $3 ${value} $5 $6`));
  }

  const handleDayOfWeekChange = value => {
    if (!value) return;
    setCron(cron.replace(pattern, `$1 $2 $3 $4 $5 ${value}`));
  }

  const handleTimeChange = value => {
    if (!value) return;
    const minute = value.format('m');
    const hour = value.format('H');
    setCron(cron.replace(pattern, `$1 ${minute} ${hour} $4 $5 $6`));
  }

  const handleMonthChange = value => {
    if (!value) return;
    setCron(cron.replace(pattern, `$1 $2 $3 $4 ${value} $6`));
  }

  const handleChangePeriod = period => {
    switch (period) {
      case 'weekly':
        setCron(cron.replace(pattern, `$1 $2 $3 * * 0`));
        break;
      case 'monthly':
        setCron(cron.replace(pattern, `$1 $2 $3 L */1 *`));
        break;
      case 'yearly':
        setCron(cron.replace(pattern, `$1 $2 $3 1 1 *`));
        break;
      default:
        throw new Error(`Unsupported period ${period}`);
    }
  }

  return (<><StyledSpace direction="vertical" size="middle">

    <Tabs type="card" defaultActiveKey={defaultPeriod} onChange={handleChangePeriod}>
      <Tabs.TabPane tab="Yearly" key="yearly">
        <div>Day <Select style={{ width: 60 }}
          onChange={handleDayOfMonthChange}
          value={dayOfMonth}
        >
          {new Array(31).fill(null).map((x, i) => <Select.Option key={i} value={`${i + 1}`}>{i + 1}</Select.Option>)}
        </Select> of <Select style={{ width: 120 }} onChange={handleMonthChange} value={month}>
            <Select.Option value="1">January</Select.Option>
            <Select.Option value="2">February</Select.Option>
            <Select.Option value="3">March</Select.Option>
            <Select.Option value="4">April</Select.Option>
            <Select.Option value="5">May</Select.Option>
            <Select.Option value="6">June</Select.Option>
            <Select.Option value="7">July</Select.Option>
            <Select.Option value="8">August</Select.Option>
            <Select.Option value="9">September</Select.Option>
            <Select.Option value="10">October</Select.Option>
            <Select.Option value="11">November</Select.Option>
            <Select.Option value="12">December</Select.Option>
          </Select> every year</div>
      </Tabs.TabPane>
      <Tabs.TabPane tab="Monthly" key="monthly">
        <div>Day <Select style={{ width: 100 }}
          onChange={handleDayOfMonthChange}
          value={dayOfMonth}
        >
          {new Array(31).fill(null).map((x, i) => <Select.Option key={i} value={`${i + 1}`}>{i + 1}</Select.Option>)}
          <Select.Option value="L">Last day</Select.Option>
        </Select> of every <Select style={{ width: 60 }} onChange={handleEveryXMonthChange} value={everyXMonth}>
            <Select.Option value="1">1</Select.Option>
            <Select.Option value="2">2</Select.Option>
            <Select.Option value="3">3</Select.Option>
            <Select.Option value="4">4</Select.Option>
            <Select.Option value="5">5</Select.Option>
            <Select.Option value="6">6</Select.Option>
          </Select> month(s)</div>
      </Tabs.TabPane>
      <Tabs.TabPane tab="Weekly" key="weekly">
        <Select style={{ width: 120 }}
          onChange={handleDayOfWeekChange}
          value={dayOfWeek}
        >
          <Select.Option value="0">Sunday</Select.Option>
          <Select.Option value="1">Monday</Select.Option>
          <Select.Option value="2">Tuesday</Select.Option>
          <Select.Option value="3">Wendesday</Select.Option>
          <Select.Option value="4">Thursday</Select.Option>
          <Select.Option value="5">Friday</Select.Option>
          <Select.Option value="6">Saturday</Select.Option>
        </Select> of every week
      </Tabs.TabPane>
    </Tabs>
    <div>At <TimePicker
      defaultValue={moment(`${hour}:${minute}`, 'H:m')}
      format="hh:mm A"
      minuteStep={5}
      use12Hours={true}
      onChange={handleTimeChange}
    /></div>
  </StyledSpace>
    <Text type="secondary">Preview: {expression || null}</Text>
  </>)
}

CronInput.propTypes = {
  value: PropTypes.string.isRequired,
};

CronInput.defaultProps = {
  value: '0 0 0 L */1 *'
};
