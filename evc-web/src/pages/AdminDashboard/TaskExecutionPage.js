import React from 'react';
import { withRouter } from 'react-router-dom';
import { Typography } from 'antd';
import { Bar } from '@ant-design/plots';
import { getTaskLogChart$ } from 'services/dataService';
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

  React.useEffect(() => {
    const sub$ = getTaskLogChart$()
      .subscribe(data => setList(data ?? []));
    return () => sub$.unsubscribe();
  }, []);

  const config = {
    data: list,
    xField: 'id',
    yField: ['endedAt', 'startedAt'],
    colorField: 'taskName',
    axis: {
      x: {}
    },
    label: {

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
