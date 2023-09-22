import React from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { Typography, Pagination, Table, Badge } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { Loading } from 'components/Loading';
import { getDashboard } from 'services/dashboardService';
import { CaretRightOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { listUnusalOptionsActivity } from 'services/dataService';
import moment from 'moment';

const { Text, Paragraph } = Typography;

const ContainerStyled = styled.div`
width: 100%;

.ant-table {
  font-size: 0.8rem;
}

`;

const DEFAULT_QUERY_INFO = {
  page: 1,
  size: 50,
};

const columnDef = [
  {
    title: 'Symbol',
    dataIndex: 'symbol',
    render: (value) => value,
  },
  {
    title: 'Price',
    dataIndex: 'price',
    render: (value) => value,
  },
  {
    title: 'Type',
    dataIndex: 'type',
    render: (value) => value,
  },
  {
    title: 'Strike',
    dataIndex: 'strike',
    render: (value) => value,
  },
  {
    title: 'Expiration Date',
    dataIndex: 'expDate',
    render: (value) => moment(value).format('D MMM YYYY'),
  },
  {
    title: 'Days To Expiration',
    dataIndex: 'dte',
    render: (value) => value,
  },
  {
    title: 'Midpoint',
    dataIndex: 'midpoint',
    render: (value) => value,
  },
  {
    title: 'Ask',
    dataIndex: 'ask',
    render: (value) => value,
  },
  {
    title: 'Last',
    dataIndex: 'last',
    render: (value) => value,
  },
  {
    title: 'Volume',
    dataIndex: 'volume',
    render: (value) => value,
  },
  {
    title: 'Open Interest',
    dataIndex: 'openInt',
    render: (value) => value,
  },
  {
    title: 'Volume/Open Interest',
    dataIndex: 'voloi',
    render: (value) => `${value} %`,
  },
  {
    title: 'IV',
    dataIndex: 'iv',
    render: (value) => value,
  },
  {
    title: 'Trade Date',
    dataIndex: 'time',
    render: (value) => moment(value).format('D MMM YYYY'),
  }
];

const UnusualOptionsActivityPanel = (props) => {

  const [data, setData] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [queryInfo, setQueryInfo] = React.useState(DEFAULT_QUERY_INFO);
  const [total, setTotal] = React.useState(0);
  const [list, setList] = React.useState([]);

  const loadList = async () => {
    searchByQueryInfo(queryInfo);
  }

  React.useEffect(() => {
    loadList();
  }, []);

  const updateWithResponse = (loadResponse, queryInfo) => {
    if (loadResponse) {
      const { count, page, data } = loadResponse;
      ReactDOM.unstable_batchedUpdates(() => {
        setTotal(count);
        setList([...data]);
        setQueryInfo({ ...queryInfo, page });
        setLoading(false);
      });
    }
  }

  const searchByQueryInfo = async (queryInfo, dryRun = false) => {
    try {
      if (!dryRun) {
        setLoading(true);
        const resp = await listUnusalOptionsActivity(props.type, queryInfo);
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

  return (
    <ContainerStyled>
      <Table
        size="small"
        columns={columnDef}
        dataSource={list}
        loading={loading}
        pagination={false}
        style={{marginBottom: '2rem', height: 'calc(100vh - 320px)'}}
        scroll={{y: 'calc(100vh - 400px)'}}
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
