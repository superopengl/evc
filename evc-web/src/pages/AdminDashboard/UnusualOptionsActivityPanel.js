import React from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { Pagination, Table, Select, Descriptions, DatePicker, Tooltip, Typography, Switch } from 'antd';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { listUnusualOptionsActivity, listAdminUnusualOptionsActivity } from 'services/dataService';
import { from } from 'rxjs';
import { GlobalContext } from 'contexts/GlobalContext';
import { LockFilled } from '@ant-design/icons';
import * as moment from 'moment-timezone';
import { FormattedMessage } from 'react-intl';

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

const DEFAULT_QUERY_INFO = {
  symbol: null,
  type: null,
  lastDayOnly: true,
  expDateFrom: null,
  expDateEnd: null,
  timeFrom: null,
  timeEnd: null,
  page: 1,
  size: 50,
};

const LockIcon = () => <Tooltip title={<FormattedMessage id="text.fullFeatureAfterPay" />}>
  <LockFilled />
</Tooltip>

const TableTitle = props => props.seq > 0 ? <>{props.children} <Text type="success" strong><sup>{props.seq}</sup></Text></> : props.children

const UnusualOptionsActivityPanel = (props) => {

  const LOCAL_STORAGE_KEY = `uoa_${props.type}_query`;

  const [loading, setLoading] = React.useState(false);
  const [queryInfo, setQueryInfo] = React.useState({
    // ...reactLocalStorage.getObject(LOCAL_STORAGE_KEY, DEFAULT_QUERY_INFO, true),
    size: props.size === 'small' ? 20 : 50,
    lastDayOnly: true,
  });
  const [total, setTotal] = React.useState(0);
  const [list, setList] = React.useState([]);
  const [symbols, setSymbols] = React.useState([]);
  const context = React.useContext(GlobalContext);

  const shouldNoCache = ['admin', 'agent'].includes(context.role);

  const loadList = async () => {
    searchByQueryInfo(queryInfo);
  }

  React.useEffect(() => {
    const load$ = from(loadList()).subscribe();
    return () => {
      load$.unsubscribe();
    }
  }, []);

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
        const resp = shouldNoCache ? await listAdminUnusualOptionsActivity(props.type, queryCondition) : await listUnusualOptionsActivity(props.type, queryCondition);
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

  const handleTypeChange = (type) => {
    searchByQueryInfo({ ...queryInfo, type, page: 1 });
  }

  const handleExpDateChange = (dates) => {
    const [from, to] = dates ?? [];
    searchByQueryInfo({
      ...queryInfo,
      expDateFrom: from?.toDate(),
      expDateTo: to?.toDate(),
      page: 1
    });
  }

  const handleTimeChange = (dates) => {
    const [from, to] = dates ?? [];
    searchByQueryInfo({
      ...queryInfo,
      timeFrom: from?.toDate(),
      timeTo: to?.toDate(),
      page: 1
    });
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

  const shouldHide = context.role === 'free' || context.role === 'guest';

  const columnDef = [
    {
      title: <TableTitle seq={findOrderSeq('symbol')}>Symbol</TableTitle>,
      dataIndex: 'symbol',
      fixed: 'left',
      width: 85,
      // sorter: { multiple: 1 },
      sortOrder: getSortOrder('symbol'),
      render: (value) => value,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      align: 'right',
      render: (value) => value,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: 50,
      align: 'center',
      render: (value) => value,
    },
    {
      title: 'Strike',
      dataIndex: 'strike',
      align: shouldHide ? 'center' : 'right',
      render: (value) => shouldHide ? <LockIcon /> : value,
    },
    {
      title: <TableTitle seq={findOrderSeq('expDate')}>Expiration Date</TableTitle>,
      dataIndex: 'expDate',
      width: 110,
      sorter: shouldHide ? false : { multiple: 1 },
      sortOrder: getSortOrder('expDate'),
      align: shouldHide ? 'center' : 'right',
      render: (value) => shouldHide ? <LockIcon /> : moment.tz(value, 'utc').format('D MMM YYYY'),
    },
    {
      title: 'Days To Expiration',
      dataIndex: 'dte',
      width: 80,
      align: shouldHide ? 'center' : 'right',
      render: (value) => shouldHide ? <LockIcon /> : value,
    },
    {
      title: 'Last',
      dataIndex: 'last',
      align: 'right',
      render: (value) => value,
    },
    {
      title: <TableTitle seq={findOrderSeq('volume')}>Volume</TableTitle>,
      dataIndex: 'volume',
      sorter: { multiple: 1 },
      sortOrder: getSortOrder('volume'),
      align: 'right',
      render: (value) => value,
    },
    {
      title: <TableTitle seq={findOrderSeq('openInt')}>Open Interest</TableTitle>,
      dataIndex: 'openInt',
      sorter: { multiple: 1 },
      sortOrder: getSortOrder('openInt'),
      align: 'right',
      width: 90,
      render: (value) => value,
    },
    {
      title: <TableTitle seq={findOrderSeq('voloi')}>Volume / Open Interest</TableTitle>,
      dataIndex: 'voloi',
      sorter: { multiple: 1 },
      sortOrder: getSortOrder('voloi'),
      align: 'right',
      width: 90,
      render: (value) => value,
    },
    {
      title: 'IV',
      dataIndex: 'iv',
      align: 'right',
      render: (value) => `${value} %`,
    },
    {
      title: <TableTitle seq={findOrderSeq('tradeDate')}>Trade Date / Time</TableTitle>,
      dataIndex: 'tradeDate',
      sorter: { multiple: 1 },
      sortOrder: getSortOrder('tradeDate'),
      width: 155,
      align: 'left',
      render: (value, item) => {
        const dateString = moment.tz(`${item.tradeDate}`, 'utc').format('DD MMM YYYY');

        if (item.tradeTime) {
          return <>{dateString} {moment(item.tradeTime, 'HH:mm:ss').format('HH:mm')} ET</>;
        } else {
          return dateString;
        }

      }
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

  const handleLastDayOnlyChange = (checked) => {
    searchByQueryInfo({
      ...queryInfo,
      lastDayOnly: checked,
      page: 1,
    })
  }

  return (
    <ContainerStyled>
      <Descriptions bordered={false} column={{
        xxl: 2,
        xl: 2,
        lg: 2,
        md: 2,
        sm: 1,
        xs: 1
      }} size="small" style={{ marginBottom: 8 }}>
        <Descriptions.Item label="Symbol">
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
        </Descriptions.Item>
        <Descriptions.Item label="Expiration Date">
          <DatePicker.RangePicker allowClear picker="date" placeholder={['From', 'To']} onChange={handleExpDateChange} />
        </Descriptions.Item>
        <Descriptions.Item label="Type">
          <Select allowClear style={{ width: 100 }} placeholder="Type" onChange={handleTypeChange}>
            <Select.Option value="Put">Put</Select.Option>
            <Select.Option value="Call">Call</Select.Option>
          </Select>
        </Descriptions.Item>
        <Descriptions.Item label="">
        </Descriptions.Item>
        <Descriptions.Item label="Last day only">
          <Tooltip title={queryInfo.lastDayOnly ? "Switch off to view all historical data" : "Switch on to only view the last day's data"}>
            <Switch checked={queryInfo.lastDayOnly} onChange={handleLastDayOnlyChange} />
          </Tooltip>
        </Descriptions.Item>
        <Descriptions.Item label="Trade Date">
          <DatePicker.RangePicker allowClear picker="date" disabled={queryInfo.lastDayOnly} placeholder={['From', 'To']} onChange={handleTimeChange} />
        </Descriptions.Item>
      </Descriptions>
      <Table
        bordered
        size="small"
        columns={columnDef}
        dataSource={list.map((x, index) => ({ ...x, index }))}
        loading={loading}
        rowKey="index"
        pagination={false}
        onChange={handleTableSortChange}
        style={{
          marginBottom: '1rem',
          // height: 'calc(100vh - 320px)' 
        }}
        scroll={{
          x: 'max-content',
          // y: 'calc(100vh - 400px)' 
        }}
      ></Table>
      <Pagination
        current={queryInfo.page}
        pageSize={queryInfo.size}
        total={total}
        defaultCurrent={queryInfo.page}
        defaultPageSize={queryInfo.size}
        pageSizeOptions={[20, 50, 100]}
        showSizeChanger
        showQuickJumper
        showTotal={total => `Total ${total}`}
        disabled={loading}
        onChange={handlePaginationChange}
        onShowSizeChange={(current, size) => {
          searchByQueryInfo({ ...queryInfo, page: current, size });
        }}
      />
    </ContainerStyled>
  );
};

UnusualOptionsActivityPanel.propTypes = {
  type: PropTypes.oneOf(['stock', 'etfs', 'index']).isRequired
};

UnusualOptionsActivityPanel.defaultProps = {};

export default withRouter(UnusualOptionsActivityPanel);
