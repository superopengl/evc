import React from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { Divider, Space, Pagination, Button, Row, Col } from 'antd';
import StockList from '../../components/StockList';
import { searchStock } from 'services/stockService';
import { withRouter } from 'react-router-dom';
import { reactLocalStorage } from 'reactjs-localstorage';
import { CheckSquareOutlined, BorderOutlined, PlusOutlined } from '@ant-design/icons';
import CreateStockModal from './CreateStockModal';
import * as queryString from 'query-string';
import { GlobalContext } from 'contexts/GlobalContext';
import { listStockTags } from 'services/stockTagService';
import PropTypes from 'prop-types';
import { TagFilterButton } from 'components/TagFilterButton';
import { from } from 'rxjs';
import { FormattedMessage } from 'react-intl';

const OverButton = styled(Button)`
color: rgba(0, 0, 0, 0.85);
background-color: #feffe6;
border-color: #fadb14;

&:active, &:focus, &:hover {
  color: rgba(0, 0, 0, 0.85);
  background: #ffffb8;
  border-color: #fadb14;
}

&.selected {
  border-color: #fadb14;
  background: #ffffb8;
}`;

const UnderButton = styled(Button)`
color: rgba(0, 0, 0, 0.85);
background: #e8feff;
border-color: #13c2c2;

&:active, &:focus, &:hover {
  color: rgba(0, 0, 0, 0.85);
  border-color: #13c2c2;
  background: #bffbff;
}

&.selected {
  border-color: #13c2c2;
  background: #bffbff;
}`;


const DEFAULT_QUERY_INFO = {
  text: '',
  tags: [],
  page: 1,
  size: 60,
  orderField: 'createdAt',
  orderDirection: 'DESC'
};

const LOCAL_STORAGE_QUERY_KEY = 'stock_query'

const StockRadarPage = (props) => {

  const { onItemClick } = props;

  const { create } = queryString.parse(props.location.search);

  const [queryInfo, setQueryInfo] = React.useState({
    ...reactLocalStorage.getObject(LOCAL_STORAGE_QUERY_KEY, DEFAULT_QUERY_INFO, true),
    size: props.size
  })
  const [total, setTotal] = React.useState(0);
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [tags, setTags] = React.useState([]);
  const [createModalVisible, setCreateModalVisible] = React.useState(create);
  const context = React.useContext(GlobalContext);

  const isAdmin = context.role === 'admin';
  const isGuest = context.role === 'guest';

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
        const resp = await searchStock(queryInfo);
        updateWithResponse(resp, queryInfo);
      } else {
        setQueryInfo(queryInfo);
      }
      // Not remember the search text in local storage
      reactLocalStorage.setObject(LOCAL_STORAGE_QUERY_KEY, { ...queryInfo, text: '' });
    } catch {
      setLoading(false);
    }
  }

  const load = async () => {
    searchByQueryInfo(queryInfo);
    setTags(await listStockTags());
  }

  React.useEffect(() => {
    const load$ = from(load()).subscribe();
    return () => {
      load$.unsubscribe();
    }
  }, []);


  const handleItemClick = stock => {
    if (onItemClick) {
      onItemClick(stock.symbol);
    } else {
      props.history.push(`/stock/${stock.symbol}`)
    }
  }

  const handleTagFilterChange = async (tags) => {
    await searchByQueryInfo({ ...queryInfo, page: 1, tags });
  }

  const handlePaginationChange = (page, pageSize) => {
    searchByQueryInfo({ ...queryInfo, page, size: pageSize });
  }

  const handleToggleOverValued = () => {
    searchByQueryInfo({ ...queryInfo, page: 1, overValued: !queryInfo.overValued });
  }

  const handleToggleUnderValued = () => {
    searchByQueryInfo({ ...queryInfo, page: 1, underValued: !queryInfo.underValued });
  }

  const handleToggleInValued = () => {
    searchByQueryInfo({ ...queryInfo, page: 1, inValued: !queryInfo.inValued });
  }


  return (
    <>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Row gutter={[10, 10]}>
            <Col flex="auto">
              <OverButton type="secondary" onClick={handleToggleOverValued} className={queryInfo.overValued ? 'selected' : ''}>
                {queryInfo.overValued ? <CheckSquareOutlined /> : <BorderOutlined />} <FormattedMessage id="text.overValued" />
            </OverButton>
            </Col>
            <Col flex="auto">
              <UnderButton type="secondary" onClick={handleToggleUnderValued} className={queryInfo.underValued ? 'selected' : ''}>
                {queryInfo.underValued ? <CheckSquareOutlined /> : <BorderOutlined />} <FormattedMessage id="text.underValued" />
            </UnderButton>
            </Col>
            <Col flex="auto">
              <Button type="default" onClick={handleToggleInValued}>
                {queryInfo.inValued ? <CheckSquareOutlined /> : <BorderOutlined />} <FormattedMessage id="text.inValued" />
            </Button>
            </Col>
            {tags && <Col flex="auto">
              <Divider type="vertical" style={{height: '100%'}} />
            </Col>}
            {tags && <Col flex="auto">
              <TagFilterButton value={queryInfo.tags} group={true} onChange={handleTagFilterChange} tags={tags} />
            </Col>}
          </Row>
          {isAdmin && <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>Add Stock</Button>}
        </Space>
      </Space>
      <Divider />
      <StockList data={list} loading={loading} onItemClick={handleItemClick} />
      <Pagination
        current={queryInfo.page}
        pageSize={queryInfo.size}
        total={total}
        defaultCurrent={queryInfo.page}
        defaultPageSize={queryInfo.size}
        pageSizeOptions={[10, 30, 60, 120]}
        showSizeChanger
        showQuickJumper
        showTotal={total => `Total ${total}`}
        disabled={loading || isGuest}
        onChange={handlePaginationChange}
        onShowSizeChange={(current, size) => {
          searchByQueryInfo({ ...queryInfo, page: current, size });
        }}
      />
      <CreateStockModal
        visible={createModalVisible}
        defaultSymbol={create}
        onOk={() => setCreateModalVisible(false)}
        onCancel={() => setCreateModalVisible(false)}
      />
    </>
  );
};

StockRadarPage.propTypes = {
  onItemClick: PropTypes.func,
  size: PropTypes.number,
};

StockRadarPage.defaultProps = {
  size: 60
};

export default withRouter(StockRadarPage);
