import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Row, Col, Modal, Select, Space, Table, Card, Typography } from 'antd';
import { TimeAgo } from 'components/TimeAgo';
import MoneyAmount from 'components/MoneyAmount';
import NumberAmount from 'components/NumberAmount';
import { countUnreadMessage } from 'services/messageService';
import { GlobalContext } from 'contexts/GlobalContext';
import { withRouter } from 'react-router-dom';
import { Loading } from './Loading';
import Highlighter from "react-highlight-words";
import { Link } from 'react-router-dom';
import { DeleteOutlined, EditOutlined, SearchOutlined, SyncOutlined, PlusOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { List } from 'antd';
import { StockName } from './StockName';
import { NumberRangeDisplay } from './NumberRangeDisplay';
import { ImRocket } from 'react-icons/im';
import StockInfoCard from './StockInfoCard';
import { timer } from 'rxjs';
import { mergeMap, filter } from 'rxjs/operators';

const { Text, Title, Paragraph } = Typography;

const StyledTable = styled(Table)`

.ant-typography {
  font-size: 0.8rem;
}

.ant-table-cell {
  background-color: white !important;
  padding: 2px !important;
}

.ant-table-thead {
  .ant-table-cell {
    color: rgba(0,0,0,0.5);
    font-size: 0.8rem;
    text-align: right;

    &:first-child {
      text-align: left;
    }
  }
}

.even-row {
  border-bottom: none;

  .ant-table-cell {
    border-bottom: none;
    padding-bottom: 0 !important;
  }
}

.odd-row {
  .ant-table-cell {
    padding-top: 0 !important;

  }
}
`;

const columnDef = [
  {
    title: 'symbol',
    render: (text, item, index) => {
      const { symbol, companyName } = item;
      if (index % 2 === 0) {
        return <Text style={{ fontSize: '0.9rem', color: '#3273A4' }} strong>{symbol}</Text>;
      }
      return {
        children: <Text type="secondary"><small>{companyName}</small></Text>,
        props: {
          colSpan: 4,
        },
      };
    }
  },
  {
    title:  'last price',
    dataIndex: 'latestPrice',
    render: (value, record, index) => index % 2 ? { props: { colSpan: 0 } } : <div style={{width: '100%', textAlign: 'right'}}><Text>{value?.toFixed(2)}</Text></div>
  },
  {
    title: 'change',
    dataIndex: 'change',
    render: (value, record, index) => index % 2 ? { props: { colSpan: 0 } } : <div style={{width: '100%', textAlign: 'right'}}><NumberAmount value={value} /></div>
  },
  {
    title: '% change',
    dataIndex: 'changePercent',
    render: (value, record, index) => index % 2 ? { props: { colSpan: 0 } } : <div style={{width: '100%', textAlign: 'right'}}><NumberAmount postfix="%" digital={2} value={value * 100} /></div>
  },
];


const StockMostPanel = (props) => {

  const { title, onFetch } = props;

  const [list, setList] = React.useState([]);

  const pollData = () => {
    return timer(0, 60 * 1000).pipe(
      mergeMap(() => onFetch()),
      filter(data => !!data),
    ).subscribe(data => setList(data));
  }

  React.useEffect(() => {
    const subscription = pollData();
    return () => {
      subscription.unsubscribe();
    }
  }, []);

  const getFormattedList = () => {
    const data = [];
    list.forEach((item, i) => {
      data.push({ key: i * 2, ...item });
      data.push({ key: i * 2 + 1, ...item });
    })
    return data;
  }

  return (
    <>    
      {title && <Title level={5}>{title}</Title>}
      <StyledTable
      dataSource={getFormattedList()}
      columns={columnDef}
      rowKey="key"
      pagination={false}
      rowClassName={(item, index) => {
        return index % 2 === 1 ? 'odd-row' : 'even-row';
      }}
      size="small"
    />
    </>
  )

};

StockMostPanel.propTypes = {
  title: PropTypes.string,
  onFetch: PropTypes.func.isRequired,
};

StockMostPanel.defaultProps = {
};

export default withRouter(StockMostPanel);
