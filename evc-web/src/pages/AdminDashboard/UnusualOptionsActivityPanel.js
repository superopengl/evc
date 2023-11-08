import React from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { Pagination, Table, Select, Descriptions, DatePicker, Tooltip } from 'antd';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { listUnusualOptionsActivity, listAdminUnusualOptionsActivity } from 'services/dataService';
import { reactLocalStorage } from 'reactjs-localstorage';
import { from } from 'rxjs';
import { GlobalContext } from 'contexts/GlobalContext';
import { LockFilled } from '@ant-design/icons';
import * as moment from 'moment-timezone';
import { FormattedMessage } from 'react-intl';

const ContainerStyled = styled.div`
width: 100%;

.ant-table {
  font-size: 0.8rem;
}

.ant-descriptions-item-label {
  width: 120px;
}

`;

const DEFAULT_QUERY_INFO = {
  symbol: null,
  type: null,
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

const UnusualOptionsActivityPanel = (props) => {

  const LOCAL_STORAGE_KEY = `uoa_${props.type}_query`;

  const [loading, setLoading] = React.useState(false);
  const [queryInfo, setQueryInfo] = React.useState({
    // ...reactLocalStorage.getObject(LOCAL_STORAGE_KEY, DEFAULT_QUERY_INFO, true),
    size: props.size === 'small' ? 20 : 50,
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

  const searchByQueryInfo = async (queryInfo, dryRun = false) => {
    try {
      if (!dryRun) {
        setLoading(true);
        const resp = shouldNoCache ? await listAdminUnusualOptionsActivity(props.type, queryInfo) : await listUnusualOptionsActivity(props.type, queryInfo);
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

  const shouldHide = context.role === 'free' || context.role === 'guest';

  const columnDef = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      fixed: 'left',
      width: 80,
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
      title: 'Expiration Date',
      dataIndex: 'expDate',
      width: 100,
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
    // {
    //   title: 'Midpoint',
    //   dataIndex: 'midpoint',
    //   width: 80,
    //   render: (value) => value,
    // },
    // {
    //   title: 'Ask',
    //   dataIndex: 'ask',
    //   width: 50,
    //   render: (value) => value,
    // },
    {
      title: 'Last',
      dataIndex: 'last',
      align: 'right',
      render: (value) => value,
    },
    {
      title: 'Volume',
      dataIndex: 'volume',
      align: 'right',
      render: (value) => value,
    },
    {
      title: 'Open Interest',
      dataIndex: 'openInt',
      align: 'right',
      width: 80,
      render: (value) => value,
    },
    {
      title: 'Volume / Open Interest',
      dataIndex: 'voloi',
      align: 'right',
      width: 80,
      render: (value) => value,
    },
    {
      title: 'IV',
      dataIndex: 'iv',
      align: 'right',
      render: (value) => `${value} %`,
    },
    {
      title: 'Trade Date',
      dataIndex: 'time',
      width: 100,
      align: 'right',
      render: (value) => moment.tz(value, 'utc').format('D MMM YYYY'),
    }
  ];

  const handleSymbolChange = (symbol) => {
    searchByQueryInfo({ ...queryInfo, symbol, page: 1 });
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
        <Descriptions.Item label="Trade Date">
          <DatePicker.RangePicker allowClear picker="date" placeholder={['From', 'To']} onChange={handleTimeChange} />
        </Descriptions.Item>
      </Descriptions>
      <Table
        size="small"
        columns={columnDef}
        dataSource={list}
        loading={loading}
        rowKey="id"
        pagination={false}
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
