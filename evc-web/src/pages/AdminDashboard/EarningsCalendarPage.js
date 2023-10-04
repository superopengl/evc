import React from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { Typography, Space, Table, Image, Card, List, Tooltip, Button, Radio } from 'antd';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import moment from 'moment';
import { getEarningsCalender } from 'services/stockService';
import {
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';

const { Text } = Typography;


const SymbolLogoCard = styled(Card)`
cursor: pointer;

&:hover {
  background-color: rgb(250,250,250);
}

.ant-card-body {
  padding: 8px;
}
`;

const StyledTable = styled(Table)`
.ant-table-cell {
  vertical-align: top;
}

.ant-table-row:hover {
  .ant-table-cell {
    background-color: white;
  }
}
`;

const EarningsCalendarPage = props => {
  const { onSymbolClick } = props;
  const [loading, setLoading] = React.useState(false);
  const [list, setList] = React.useState([]);
  const [week, setWeek] = React.useState(0);
  const [showLogo, setShowLogo] = React.useState(true);

  const load = async (week = 0) => {
    if (week < 0) {
      week = 0;
    }
    try {
      setLoading(true);
      const data = await getEarningsCalender(week);
      const list = [{ key: 0, ...data }];
      ReactDOM.unstable_batchedUpdates(() => {
        setWeek(week);
        setList(list);
        setLoading(false);
      })
    } catch {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load(week);
  }, []);

  const handleItemClick = (symbol) => {
    onSymbolClick(symbol);
  }

  const handleWeekChange = async (change) => {
    await load(change ? week + change : 0);
  }

  const renderDataList = (list) => {
    if (!list) return null;
    return <List
      grid={{
        column: 1,
        gutter: [0, 10]
      }}
      dataSource={list}
      renderItem={item => <Tooltip title={item.company} placement="top">
        <SymbolLogoCard size="small" onClick={() => handleItemClick(item.symbol)} >
          <div style={{ display: 'flex', flexDirection: showLogo ? 'row' : 'column', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Text style={{ color: '#3273A4' }} strong>{item.symbol}</Text>
            {showLogo ? <Image src={item.logoUrl} width={64} height="auto" preview={false} /> : <Text type="secondary"><small>{item.company}</small></Text>}
          </div>
        </SymbolLogoCard>
      </Tooltip>}
    />
  }

  const renderTitleComponent = (dayOfWeek) => {
    const date = moment().add(week, 'week').day(dayOfWeek);
    const isToday = date.isSame(moment(), 'day');
    return <>
      <div><Text type={isToday ? 'success' : null}>{dayOfWeek}</Text></div>
      <Text type={isToday ? 'success' : 'secondary'}><small>{date.format('D MMM YYYY')}</small></Text>
    </>
  }


  const columnDef = [
    {
      title: renderTitleComponent('Mon'),
      align: 'center',
      dataIndex: 'Mon',
      width: '20%',
      render: (value) => renderDataList(value),
    },
    {
      title: renderTitleComponent('Tue'),
      align: 'center',
      dataIndex: 'Tue',
      width: '20%',
      render: (value) => renderDataList(value),
    },
    {
      title: renderTitleComponent('Wed'),
      align: 'center',
      dataIndex: 'Wed',
      width: '20%',
      render: (value) => renderDataList(value),
    },
    {
      title: renderTitleComponent('Thu'),
      align: 'center',
      dataIndex: 'Thu',
      width: '20%',
      render: (value) => renderDataList(value),
    },
    {
      title: renderTitleComponent('Fri'),
      align: 'center',
      dataIndex: 'Fri',
      width: '20%',
      render: (value) => renderDataList(value),
    }
  ];

  const handleToggleLogo = (e) => {
    setShowLogo(e.target.value === 'logo');
  }

  return (
    <Space style={{ width: '100%' }} direction="vertical" size="large">
      <Space style={{ width: '100%', justifyContent: "space-between" }}>
        <Space>
          <Button type="primary" disabled={week === 0 || loading} onClick={() => handleWeekChange(0)}>Today</Button>
          <Button type="primary" shape="circle" icon={<LeftOutlined />} disabled={week === 0 || loading} onClick={() => handleWeekChange(-1)}></Button>
          <Button type="primary" shape="circle" icon={<RightOutlined />} disabled={week >= 52 || loading} onClick={() => handleWeekChange(1)}></Button>
        </Space>
        <Space size="small">
          <Radio.Group defaultValue="logo" buttonStyle="solid" onChange={handleToggleLogo}>
            <Radio.Button value="logo">Show logo</Radio.Button>
            <Radio.Button value="name">Company name</Radio.Button>
          </Radio.Group>
        </Space>
      </Space>
      <StyledTable
        size="small"
        columns={columnDef}
        dataSource={list}
        loading={loading}
        bordered={true}
        pagination={false}
        rowKey="key"
        scroll={{x: 500}}
        style={{ marginBottom: '2rem' }}
      />
    </Space>
  );
};

EarningsCalendarPage.propTypes = {
  onSymbolClick: PropTypes.func,
};

EarningsCalendarPage.defaultProps = {
  onSymbolClick: () => { }
};

export default withRouter(EarningsCalendarPage);
