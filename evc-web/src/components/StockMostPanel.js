import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Table, Typography } from 'antd';
import NumberAmount from 'components/NumberAmount';
import { withRouter } from 'react-router-dom';
import { timer } from 'rxjs';
import { mergeMap, filter } from 'rxjs/operators';
import ReactDOM from 'react-dom';

const { Text, Title, Link: TextLink } = Typography;

const StyledTable = styled(Table)`

.ant-typography {
  font-size: 0.9rem;
}

.ant-table-cell {
  background-color: white !important;
  padding: 2px !important;
}

.ant-table-thead {
  .ant-table-cell {
    color: rgba(0,0,0,0.3);
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

const StyledSymbolTextLink = styled(TextLink)`
&.ant-typography {
  font-size: 0.9rem;
  font-weight: bold;
  // color: #3273A4;
  color: rgba(0,0,0,0.85);

  &:hover {
    text-decoration: underline;
  }
}
`;

const StockMostPanel = (props) => {
  const columnDef = [
    {
      title: 'symbol',
      render: (text, item, index) => {
        const { symbol, companyName } = item;
        if (index % 2 === 0) {
          return <StyledSymbolTextLink onClick={() => onSymbolClick(symbol)}>{symbol}</StyledSymbolTextLink>;
        }
        return {
          children: <Text type="secondary">{companyName}</Text>,
          props: {
            colSpan: 4,
          },
        };
      }
    },
    {
      title: 'last price',
      dataIndex: 'latestPrice',
      render: (value, record, index) => index % 2 ? { props: { colSpan: 0 } } : <div style={{ width: '100%', textAlign: 'right' }}><Text>{value?.toFixed(2)}</Text></div>
    },
    {
      title: 'change',
      dataIndex: 'change',
      render: (value, record, index) => index % 2 ? { props: { colSpan: 0 } } : <div style={{ width: '100%', textAlign: 'right' }}><NumberAmount value={value} /></div>
    },
    {
      title: '% change',
      dataIndex: 'changePercent',
      render: (value, record, index) => index % 2 ? { props: { colSpan: 0 } } : <div style={{ width: '100%', textAlign: 'right' }}><NumberAmount postfix="%" digital={2} value={value * 100} /></div>
    },
  ];

  const { title, onFetch,titleStyle, onSymbolClick } = props;

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

  const pollData = () => {
    return timer(0, 5 * 60 * 1000).pipe(
      mergeMap(() => onFetch()),
      filter(data => !!data),
    ).subscribe(data => {
      ReactDOM.unstable_batchedUpdates(() => {
        setList(data);
        setLoading(false);
      })
    });
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
      {title && <Title level={4} style={{...titleStyle}} strong>{title}</Title>}
      <StyledTable
        dataSource={getFormattedList()}
        loading={loading}
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
  titleStyle: PropTypes.any,
  onFetch: PropTypes.func.isRequired,
  onSymbolClick: PropTypes.func
};

StockMostPanel.defaultProps = {
  onSymbolClick: () => { },
};

export default withRouter(StockMostPanel);
