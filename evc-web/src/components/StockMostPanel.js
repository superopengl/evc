import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Table, Typography } from 'antd';
import NumberAmount from 'components/NumberAmount';
import { withRouter } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { FormattedMessage } from 'react-intl';

const { Text, Title, Link: TextLink } = Typography;

const StyledTable = styled(Table)`

.ant-typography {
  font-size: 0.8rem;
}

.ant-table-cell {
  background-color: white !important;
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
        const { symbol, company } = item;
        if (index % 2 === 0) {
          return <StyledSymbolTextLink onClick={() => onSymbolClick(symbol)}>{symbol}</StyledSymbolTextLink>;
        }
        return {
          children: <Text type="secondary">{company || symbol}</Text>,
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

  const { title, value, titleStyle, loading, onSymbolClick } = props;

  const [list, setList] = React.useState([]);

  React.useEffect(() => {
    const dataList = [];
    (value || []).forEach((item, i) => {
      dataList.push({ key: i * 2, ...item });
      dataList.push({ key: i * 2 + 1, ...item });
    })

    setList(dataList);
  }, [value]);

  return (
    <>
      {title && <Title level={5} style={{ ...titleStyle }} strong>{title}</Title>}
      <StyledTable
        dataSource={list}
        loading={loading}
        columns={columnDef}
        rowKey="key"
        pagination={false}
        rowClassName={(item, index) => {
          return index % 2 === 1 ? 'odd-row' : 'even-row';
        }}
        size="small"
        locale={{
          emptyText: <div style={{ maxWidth: 220, textAlign: 'center', margin: '20px auto', fontStyle: 'italic' }}>
            <FormattedMessage id="text.mostEmpty" />
          </div>
        }}
      />
    </>
  )

};

StockMostPanel.propTypes = {
  title: PropTypes.string,
  titleStyle: PropTypes.any,
  value: PropTypes.array,
  loading: PropTypes.bool,
  onSymbolClick: PropTypes.func
};

StockMostPanel.defaultProps = {
  value: [],
  loading: true,
  onSymbolClick: () => { },
};

export default withRouter(StockMostPanel);
