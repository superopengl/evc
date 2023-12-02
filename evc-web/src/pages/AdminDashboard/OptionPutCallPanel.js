import React from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { Pagination, Table, Select, Space, Typography, Button, Row, Col } from 'antd';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { listOptionPutCallHistory } from 'services/dataService';
import { PlusOutlined } from '@ant-design/icons';
import * as moment from 'moment-timezone';
import { Modal } from 'antd';
import { Loading } from 'components/Loading';

const { Text } = Typography;

const ContainerStyled = styled.div`
width: 100%;

.ant-table {
  font-size: 0.8rem;

  td.ant-table-column-sort {
    background-color: #57BB6022;
  }
}

.ant-descriptions-item-label {
  width: 120px;
}

`;


const TableTitle = props => props.seq > 0 ? <>{props.children} <Text type="success" strong><sup>{props.seq}</sup></Text></> : props.children

const OptionPutCallPanel = (props) => {
  const { type, symbol, lastDayOnly } = props;

  if (!type && !symbol) {
    throw new Error(`Either type or symbol must be specified`);
  }

  const isMultiSymbolMode = !!type;
  const [loading, setLoading] = React.useState(false);
  const [queryInfo, setQueryInfo] = React.useState({
    // ...reactLocalStorage.getObject(LOCAL_STORAGE_KEY, DEFAULT_QUERY_INFO, true),
    size: props.size === 'small' ? 20 : 50,
    lastDayOnly: true,
  });
  const [total, setTotal] = React.useState(0);
  const [list, setList] = React.useState([]);
  const [symbols, setSymbols] = React.useState([]);

  React.useEffect(() => {
    searchByQueryInfo({
      ...queryInfo,
      type,
      symbol,
      lastDayOnly,
    })
  }, [type, symbol, lastDayOnly]);

  const updateWithResponse = (loadResponse, queryInfo) => {
    if (loadResponse) {
      // reactLocalStorage.setObject(LOCAL_STORAGE_KEY, queryInfo);
      const { count, page, data, symbols } = loadResponse;
      ReactDOM.unstable_batchedUpdates(() => {
        setTotal(count);
        setList(data);
        setSymbols(symbols);
        setQueryInfo({ ...queryInfo, page });
        setLoading(false);
      });
    }
  }

  const getQueryConditions = (queryInfo) => {
    return {
      ...queryInfo,
      order: queryInfo.order?.map(x => ({
        field: x.field,
        order: x.order === 'descend' ? 'DESC' : 'ASC'
      }))
    }
  }

  const searchByQueryInfo = async (queryInfo, dryRun = false) => {
    try {
      if (!dryRun) {
        setLoading(true);
        const queryCondition = getQueryConditions(queryInfo);
        // const resp = shouldNoCache ? await listAdminUnusualOptionsActivity(props.type, queryCondition) : await listOptionPutCallHistory(props.type, queryCondition);
        const resp = await listOptionPutCallHistory(queryCondition);
        updateWithResponse(resp, queryInfo);
      } else {
        setQueryInfo(queryInfo);
      }
    } catch {
      setLoading(false);
    }
  }

  const handlePaginationChange = (page, pageSize) => {
    searchByQueryInfo({ ...queryInfo, page, size: pageSize });
  }


  const getSortOrder = (key) => {
    const order = queryInfo.order ?? [];
    for (const item of order) {
      if (item.field === key) {
        return item.order;
      }
    }
    return false;
  }

  const findOrderSeq = (key) => {
    const index = (queryInfo.order ?? []).findIndex(x => x.field === key);
    return index + 1;
  }


  const handleShowDetail = async (symbol) => {
    const modalInstance = Modal.info({
      icon: null,
      title: <><Text strong>{symbol}</Text> Option History</>,
      closable: true,
      maskClosable: true,
      style: { top: 40, height: 500 },
      // width: 'calc(100vw - 80px)',
      width: 900,
      content: <Loading />
    })
    const { data: allHistoryData } = await listOptionPutCallHistory({ symbol });
    modalInstance.update({
      content: <Table
        bordered={false}
        size="small"
        columns={columnDef.filter((x, i) => i > 2)}
        dataSource={allHistoryData.map((x, index) => ({ ...x, index }))}
        loading={loading}
        rowKey="index"
        pagination={false}
        style={{
          // marginBottom: '1rem',
          // height: 'calc(100vh - 320px)' 
        }}
        scroll={{
          x: 'max-content',
          y: 'calc(100vh - 300px)'

        }}
      />
    })
  }

  const columnDef = [
    {
      render: (value, record) => <Button shape='circle' size="small" icon={<PlusOutlined />} type="default" onClick={() => handleShowDetail(record.symbol)} />
    },
    {
      title: <TableTitle seq={findOrderSeq('symbol')}>Symbol</TableTitle>,
      dataIndex: 'symbol',
      fixed: 'left',
      // width: 85,
      sorter: { multiple: 1 },
      sortOrder: getSortOrder('symbol'),
      render: (value) => value,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      render: (value) => value,
    },
    {
      title: <TableTitle seq={findOrderSeq('tradeDate')}>Date</TableTitle>,
      dataIndex: 'date',
      sorter: { multiple: 2 },
      sortOrder: getSortOrder('date'),
      // width: 155,
      align: 'left',
      render: (value) => {
        const dateString = moment.tz(`${value}`, 'utc').format('DD MMM YYYY');
        return dateString;
      }
    },
    {
      title: 'Today Option Volume',
      dataIndex: 'todayOptionVol',
      align: 'right',
      render: (value) => (Math.round(+value)).toLocaleString(),
    },
    {
      title: 'Today %Put Vol',
      dataIndex: 'todayPercentPutVol',
      align: 'right',
      render: (value) => (+value).toFixed(2) + '%',
    },
    {
      title: 'Today %Call Vol',
      dataIndex: 'todayPercentCallVol',
      align: 'right',
      render: (value) => (+value).toFixed(2) + '%',
    },
    {
      title: 'Total P/C OI Ratio',
      dataIndex: 'putCallVol',
      align: 'right',
      render: (value) => (+value).toFixed(3),
    },
    {
      title: 'Total Open Interest',
      dataIndex: 'totalOpenInterest',
      align: 'right',
      render: (value) => (Math.round(+value)).toLocaleString(),
    },
  ];

  const handleSymbolChange = (symbol) => {
    searchByQueryInfo({ ...queryInfo, symbol, page: 1 });
  }

  const handleTableSortChange = (pagination, filters, sorter) => {
    searchByQueryInfo({
      ...queryInfo,
      order: (Array.isArray(sorter) ? sorter : [sorter]).filter(x => x.order).map(x => ({ field: x.field, order: x.order })),
    });
  }


  return (
    <ContainerStyled>
      {isMultiSymbolMode && <Row style={{ marginBottom: 20 }} align='middle'>
        <Text style={{ marginRight: '1rem' }}>Symbol: </Text>
        <Select allowClear style={{ width: 100 }} placeholder="Symbol"
          // onSearch={handleSymbolChange}
          onChange={handleSymbolChange}
          showSearch
          filterOption={(input, option) => {
            const match = input.toLowerCase();
            const symbol = option.key;
            return symbol.toLowerCase().includes(match);
          }}
        >
          {symbols.map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
        </Select>
      </Row>}
      <Table
        bordered={false}
        size="small"
        columns={columnDef}
        dataSource={list.map((x, index) => ({ ...x, index }))}
        loading={loading}
        rowKey="index"
        pagination={false}
        onChange={handleTableSortChange}
        onRow={(record, index) => {
          return {
            onDoubleClick: () => {
              handleShowDetail(record.symbol)
            }
          }
        }}
        style={{
          // marginBottom: '1rem',
          // height: 'calc(100vh - 320px)' 
        }}
        scroll={{
          x: 'max-content',
          y: 'calc(100vh - 370px)'
        }}
      ></Table>
      {isMultiSymbolMode && <Row justify='end'>
        {total > queryInfo.size && <Pagination
          current={queryInfo.page}
          pageSize={queryInfo.size}
          total={total}
          defaultCurrent={queryInfo.page}
          defaultPageSize={queryInfo.size}
          pageSizeOptions={[20, 50, 100]}
          showSizeChanger
          showQuickJumper
          showTotal={total => `Total ${total}`}
          style={{ marginTop: '1rem' }}
          disabled={loading}
          onChange={handlePaginationChange}
          onShowSizeChange={(current, size) => {
            searchByQueryInfo({ ...queryInfo, page: current, size });
          }}
        />}
      </Row>}
    </ContainerStyled>
  );
};

OptionPutCallPanel.propTypes = {
  type: PropTypes.oneOf(['index', 'etfs', 'nasdaq']),
  symbol: PropTypes.string,
  lastDayOnly: PropTypes.bool,
};

OptionPutCallPanel.defaultProps = {
  lastDayOnly: true,
};

export default withRouter(OptionPutCallPanel);
