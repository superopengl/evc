import React from 'react';
import { withRouter } from 'react-router-dom';
import { Typography } from 'antd';
import { Bar } from '@ant-design/plots';
import { getTaskLogChart$ } from 'services/dataService';
import * as moment from 'moment-timezone';
const { Title } = Typography;

const span = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 24,
  xl: 24,
  xxl: 12
};

const TaskExecutionPage = () => {
  const [list, setList] = React.useState([]);

  const utcStringToEstEpochMills = (utcString) => {
    return moment.utc(utcString).tz('America/New_York').format('D MMM');
  }

  const formatData = (data) => {
    return data.map(x => ({
      ...x,
      startedAtEst: utcStringToEstEpochMills(x.startedAt),
      endedAtEst: utcStringToEstEpochMills(x.endedAt),
    }));
  }

  React.useEffect(() => {
    const sub$ = getTaskLogChart$()
      .subscribe(data => setList(data ?? []));
    return () => sub$.unsubscribe();
  }, []);

  const minDate = new Date(Math.min(list.map(d => new Date(d.startedAt))));
  const maxDate = new Date(Math.max(list.map(d => new Date(d.endedAt))));

  const config = {
    data: list,
    xField: 'id',
    yField: ['endedAt', 'startedAt'],
    colorField: 'taskName',
    tooltip: {
      fields: ['taskName', 'startedAtEst', 'endedAtEst'],
    },
    label: {

    },

    scrollbar: {
      y: {}
    }
  };

  return (
    <>
      <Title level={3}>Task Execution (30 days)</Title>
      <Bar {...config} />
    </>
  );
};

TaskExecutionPage.propTypes = {};

TaskExecutionPage.defaultProps = {};

export default withRouter(TaskExecutionPage);
