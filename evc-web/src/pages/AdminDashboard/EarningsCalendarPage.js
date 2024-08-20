import React from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { Typography, Space, Table, Image, Card, List, Tooltip, Button, Switch } from 'antd';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import moment from 'moment';
import { getEarningsCalender } from 'services/stockService';
import {
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { from } from 'rxjs';
import take from 'lodash/take';
import { getStockLogoUrl } from '../../util/getStockLogoUrl';

const { Text } = Typography;


const SymbolLogo = styled.div`
cursor: pointer;

&:hover {
  background-color: rgb(250,250,250);
}

// margin: 4px 0;

.ant-card-body {
  padding: 8px;
}
`;

const StyledTable = styled(Table)`
.ant-table-cell {
  vertical-align: top;
}

.ant-table-thead {
  .ant-table-row:hover {
    .col-mon {
      background-color: rgba(87,187,96,0.5);
    }
    .col-tue {
      background-color: rgba(87,187,96,0.4);
    }
    .col-wed {
      background-color: rgba(87,187,96,0.3);
    }
    .col-thu {
      background-color: rgba(87,187,96,0.2);
    }
    .col-fri {
      background-color: rgba(87,187,96,0.1);
    }
  }
}
  
.ant-table-tbody {
  .ant-table-row:hover {
    .col-mon {
      background-color: rgba(0,41,61,0.08);
    }
    .col-tue {
      background-color: rgba(0,41,61,0.06);
    }
    .col-wed {
      background-color: rgba(0,41,61,0.04);
    }
    .col-thu {
      background-color: rgba(0,41,61,0.02);
    }
    .col-fri {
      background-color: rgba(255,255,255);
    }
  }
}

.ant-table-thead {
  .col-mon {
    background-color: rgba(87,187,96,0.5);
  }
  .col-tue {
    background-color: rgba(87,187,96,0.4);
  }
  .col-wed {
    background-color: rgba(87,187,96,0.3);
  }
  .col-thu {
    background-color: rgba(87,187,96,0.2);
  }
  .col-fri {
    background-color: rgba(87,187,96,0.1);
  }
}

.ant-table-tbody {
  .col-mon {
    background-color: rgba(0,41,61,0.08);
  }
  .col-tue {
    background-color: rgba(0,41,61,0.06);
  }
  .col-wed {
    background-color: rgba(0,41,61,0.04);
  }
  .col-thu {
    background-color: rgba(0,41,61,0.02);
  }
  .col-fri {
    background-color: rgba(255,255,255);
  }
}
`;

const EarningsCalendarPage = props => {
  const { onSymbolClick, height } = props;
  const [loading, setLoading] = React.useState(false);
  const [list, setList] = React.useState([]);
  const [week, setWeek] = React.useState(0);
  const [showMore, setShowMore] = React.useState(false);
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
    const load$ = from(load(week)).subscribe();
    return () => {
      load$.unsubscribe();
    }
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
      dataSource={showMore ? list : take(list, 10)}
      renderItem={item => <Tooltip title={item.company} placement="top">
        <SymbolLogo>
          <Card size="small" onClick={() => handleItemClick(item.symbol)} >
            <div style={{ display: 'flex', flexDirection: showLogo ? 'row' : 'column', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Text strong>{item.symbol}</Text>
              {showLogo ? <Image src={getStockLogoUrl(item.symbol)}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAAtJREFUGFdjYAACAAAFAAGq1chRAAAAAElFTkSuQmCC"
                height={32}
                width="auto"
                preview={false}
                style={{ marginLeft: 4 }} /> : <Text type="secondary"><small>{item.company}</small></Text>}
            </div>
          </Card>
        </SymbolLogo>
      </Tooltip>}
    />
  }

  const renderTitleComponent = (dayOfWeek) => {
    const date = moment().add(week, 'week').day(dayOfWeek);
    const isToday = date.isSame(moment(), 'day');
    return <>
      <div><Text style={{ fontWeight: isToday ? 800 : 400 }}>{dayOfWeek}</Text></div>
      <Text type="secondary" style={{ fontWeight: isToday ? 600 : 400 }}><small>{date.format('D MMM YYYY')}</small></Text>
    </>
  }


  const columnDef = [
    {
      title: renderTitleComponent('Mon'),
      align: 'center',
      dataIndex: 'Mon',
      className: 'col-mon',
      width: '20%',
      render: (value) => renderDataList(value),
    },
    {
      title: renderTitleComponent('Tue'),
      align: 'center',
      dataIndex: 'Tue',
      width: '20%',
      className: 'col-tue',
      render: (value) => renderDataList(value),
    },
    {
      title: renderTitleComponent('Wed'),
      align: 'center',
      dataIndex: 'Wed',
      width: '20%',
      className: 'col-wed',
      render: (value) => renderDataList(value),
    },
    {
      title: renderTitleComponent('Thu'),
      align: 'center',
      dataIndex: 'Thu',
      width: '20%',
      className: 'col-thu',
      render: (value) => renderDataList(value),
    },
    {
      title: renderTitleComponent('Fri'),
      align: 'center',
      dataIndex: 'Fri',
      width: '20%',
      className: 'col-fri',
      render: (value) => renderDataList(value),
    }
  ];

  const handleToggleLogo = (checked) => {
    setShowLogo(checked);
  }

  return (
    <Space style={{ width: '100%' }} direction="vertical" size="large">
      <Space style={{ width: '100%', justifyContent: "space-between" }}>
        <Space>
          <Button type="primary" disabled={week === 0 || loading} onClick={() => handleWeekChange(0)}>Today</Button>
          <Button type="primary" shape="circle" icon={<LeftOutlined />} disabled={week === 0 || loading} onClick={() => handleWeekChange(-1)}></Button>
          <Button type="primary" shape="circle" icon={<RightOutlined />} disabled={week >= 52 || loading} onClick={() => handleWeekChange(1)}></Button>
        </Space>
        <Space>
          Logo
          <Switch defaultChecked={showLogo} onChange={handleToggleLogo} />
        </Space>
      </Space>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <StyledTable
          size="small"
          columns={columnDef}
          dataSource={list}
          loading={loading}
          bordered={false}
          pagination={false}
          rowKey="key"
          scroll={height ? { x: 500, y: height } : { x: 500 }}
        // style={{ marginBottom: '2rem' }}
        />
        {!showMore && <Button type="link" onClick={() => setShowMore(true)} style={{ marginTop: '1rem' }}>more</Button>}
      </div>
    </Space>
  );
};

EarningsCalendarPage.propTypes = {
  onSymbolClick: PropTypes.func,
  height: PropTypes.number
};

EarningsCalendarPage.defaultProps = {
  onSymbolClick: () => { }
};

export default withRouter(EarningsCalendarPage);
