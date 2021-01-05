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

const Container = styled.div`
`;

const StyledTable = styled(Table)`
.ant-typography {
  font-size: 0.8rem;
}

.ant-table-cell {
  background-color: white !important;
  padding-top: 2px !important;
  padding-bottom: 2px !important;
}

.ant-table-thead {
  .ant-table-cell {
    color: rgba(0,0,0,0.5);
    font-size: 0.8rem;
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

const CellSpace = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 100%;
  text-align: right;
`;

const columnDef = [
  {
    title: 'Symbol',
    render: (text, item, index) => {
      const { symbol, company } = item;
      if (index % 2 === 0) {
        return <Text style={{ fontSize: '1rem' }} strong>{symbol}</Text>;
      }
      return {
        children: <Text type="secondary"><small>{company}</small></Text>,
        props: {
          colSpan: 4,
        },
      };
    }
  },
  {
    title: <div style={{ width: '100%', textAlign: 'right' }}>Fair value</div>,
    render: (value, item, index) => index % 2 ? { props: { colSpan: 0 } } : <CellSpace>
      <NumberRangeDisplay lo={item.fairValueLo} hi={item.fairValueHi} />
    </CellSpace>
  },
  {
    title: <div style={{ width: '100%', textAlign: 'right' }}>Support</div>,
    render: (value, item, index) => index % 2 ? { props: { colSpan: 0 } } : <CellSpace>
      <NumberRangeDisplay lo={item.supportShortLo} hi={item.supportShortHi} />
      <NumberRangeDisplay lo={item.supportLongLo} hi={item.supportLongHi} />
    </CellSpace>
  },
  {
    title: <div style={{ width: '100%', textAlign: 'right' }}>Resistance</div>,
    render: (value, item, index) => index % 2 ? { props: { colSpan: 0 } } : <CellSpace>
      <NumberRangeDisplay lo={item.resistanceShortLo} hi={item.resistanceShortHi} />
      <NumberRangeDisplay lo={item.resistanceLongLo} hi={item.resistanceLongHi} />
    </CellSpace>
  },
];


const StockMostSearched = (props) => {

  const { title, onFetch } = props;

  const [list, setList] = React.useState([]);

  const pollData = () => {
    return timer(0, 15 * 1000).pipe(
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
    <Container>
      {title && <Text>{title}</Text>}
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
    </Container>
  )

};

StockMostSearched.propTypes = {
  title: PropTypes.string,
  onFetch: PropTypes.func.isRequired,
};

StockMostSearched.defaultProps = {
};

export default withRouter(StockMostSearched);
