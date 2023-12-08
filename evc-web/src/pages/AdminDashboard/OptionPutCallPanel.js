import React from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { Pagination, Table, Select, Space, Typography, Button, Row, Col } from 'antd';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { listOptionPutCallHistory, listLatestOptionPutCall } from 'services/dataService';
import { PlusOutlined, SyncOutlined } from '@ant-design/icons';
import * as moment from 'moment-timezone';
import { Modal } from 'antd';
import { Loading } from 'components/Loading';
import { GlobalContext } from 'contexts/GlobalContext';
import { LockIcon } from '../../components/LockIcon';
import * as _ from 'lodash';
import { Tag } from 'antd';

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
  const { data } = props;

  const [loading, setLoading] = React.useState(true);
  const [queryInfo, setQueryInfo] = React.useState({
    // ...reactLocalStorage.getObject(LOCAL_STORAGE_KEY, DEFAULT_QUERY_INFO, true),
    size: props.size === 'small' ? 20 : 50,
    lastDayOnly: true,
  });
  const [total, setTotal] = React.useState(0);
  const [list, setList] = React.useState([]);
  const [symbols, setSymbols] = React.useState([]);
  const [selectedSymbol, setSelectedSymbol] = React.useState();
  const context = React.useContext(GlobalContext);

  const shouldHide = context.role === 'free' || context.role === 'guest';

  React.useEffect(() => {
    setList(data);
    setSymbols(_.sortBy(_.union(data.map(d => d.symbol))));
    setTotal(data.length);
    setLoading(false);

  }, [data]);

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
        const resp = await listLatestOptionPutCall(queryCondition);
        // updateWithResponse(resp, queryInfo);
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
      fixed: 'left',
      width: 40,
      align: 'center',
      render: (value, record) => <Button shape='circle' size="small" icon={<PlusOutlined />} type="text" onClick={() => handleShowDetail(record.symbol)} disabled={!record.date} />
    },
    {
      title: <TableTitle seq={findOrderSeq('symbol')}>Symbol</TableTitle>,
      dataIndex: 'symbol',
      fixed: 'left',
      width: 100,
      filters: symbols.map(s => ({ text: s, value: s })),
      filterMode: 'tree',
      filterSearch: true,
      onFilter: (value, record) => record.name.startsWith(value),
      sorter: (a, b) => a.symbol.localeCompare(b.symbol),
      // sortOrder: getSortOrder('symbol'),
      render: (value) => value,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (value) => value,
    },
    {
      title: <TableTitle seq={findOrderSeq('tradeDate')}>Date</TableTitle>,
      dataIndex: 'date',
      sorter: (a, b) => moment(a.date) - moment(b.date),
      // width: 155,
      align: 'left',
      render: (value) => {
        if (!value) {
          return <Tag color="warning">Data is coming soon</Tag>
        }
        const dateString = moment.tz(`${value}`, 'utc').format('DD MMM YYYY');
        return dateString;
      }
    },
    {
      title: 'Today Option Volume',
      dataIndex: 'todayOptionVol',
      align: 'right',
      render: (value) => _.isNull(value) ? null : (Math.round(+value)).toLocaleString(),
    },
    {
      title: 'Today %Put Vol',
      dataIndex: 'todayPercentPutVol',
      align: shouldHide ? 'center' : 'right',
      render: (value) => shouldHide ? <LockIcon /> : _.isNull(value) ? null : (+value).toFixed(2) + '%',
    },
    {
      title: 'Today %Call Vol',
      dataIndex: 'todayPercentCallVol',
      align: shouldHide ? 'center' : 'right',
      render: (value) => shouldHide ? <LockIcon /> : _.isNull(value) ? null : (+value).toFixed(2) + '%',
    },
    {
      title: 'Total P/C OI Ratio',
      dataIndex: 'putCallVol',
      align: shouldHide ? 'center' : 'right',
      render: (value) => shouldHide ? <LockIcon /> : _.isNull(value) ? null : (+value).toFixed(3),
    },
    {
      title: 'Total Open Interest',
      dataIndex: 'totalOpenInterest',
      align: 'right',
      render: (value) => _.isNull(value) ? null : (Math.round(+value)).toLocaleString(),
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
      {/* <Row style={{ marginBottom: 20 }} align='middle'>
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
      </Row> */}
      <Table
        bordered={false}
        size="small"
        columns={columnDef}
        dataSource={list.map((x, index) => ({ ...x, index }))}
        loading={loading}
        rowKey="index"
        pagination={{
          pageSizeOptions: [20, 50, 100],
          total: list.length,
          showSizeChanger: true,
          showTotal: total => `Total ${total}`,
        }}
        // onChange={handleTableSortChange}
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
      {/* <Row justify='end'>
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
      </Row> */}
    </ContainerStyled>
  );
};

OptionPutCallPanel.propTypes = {
  type: PropTypes.oneOf(['index', 'etfs', 'nasdaq']),
  data: PropTypes.arrayOf(PropTypes.any),
};

OptionPutCallPanel.defaultProps = {
};

export default withRouter(OptionPutCallPanel);
