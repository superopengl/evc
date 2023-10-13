
import React from 'react';
import { List, Typography, Space, Button, Tooltip, Alert } from 'antd';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import MoneyAmount from 'components/MoneyAmount';
import styled from 'styled-components';
import { StockEpsInput } from './StockEpsInput';
import { ConfirmDeleteButton } from './ConfirmDeleteButton';
import { syncStockEps } from 'services/stockService';
import { SyncOutlined } from '@ant-design/icons';
const { Text } = Typography;

const Container = styled.div`
  .current-published {
    background-color: rgba(87,187,96, 0.1);
  }
`;


const StockEpsAdminEditor = (props) => {
  const { onLoadList, onSaveNew, onDelete, onChange, onSelected } = props;
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

  const updateList = list => {
    setList(list);
    onChange(list);
  }

  const loadEntity = async () => {
    try {
      setLoading(true);
      updateList(await onLoadList());
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadEntity();
  }, []);

  const handleSave = async (range) => {
    try {
      setLoading(true);
      await onSaveNew(range);
      updateList(await onLoadList());
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteItem = async (item) => {
    try {
      setLoading(true);
      await onDelete(item.symbol, item.reportDate);
      updateList(await onLoadList());
    } finally {
      setLoading(false);
    }
  }

  const handleSyncEps = async () => {
    try {
      setLoading(true);
      await syncStockEps(props.symbol);
      loadEntity();
    } finally {
      setLoading(false);
    }
  }

  return <Container>
    <Space size="small" direction="vertical" style={{ width: '100%' }}>
      <Alert description={<>
      It's required to have at least 6 EPS values (back to one and half years ago) to calculate fair values.<br/>
      Manually adding EPS value is a heavy operation as it will cause system to recalculate many values like PE90 and fair values. 
      </>}
        type="info"
        showIcon
      />
      <Space size="small" style={{ width: '100%', justifyContent: 'space-between' }}>
        <StockEpsInput onSave={handleSave} disabled={loading} />
        <Tooltip title="Fetch last 8 EPS from IEX API">
          <Button type="primary" disabled={loading} onClick={() => handleSyncEps()} loading={loading} icon={<SyncOutlined />}></Button>
        </Tooltip>
      </Space>
      <List
        dataSource={list}
        loading={loading}
        itemLayout="horizontal"
        rowKey="id"
        size="small"
        locale={{ emptyText: ' ' }}
        renderItem={(item) => (
          <List.Item
            onClick={() => onSelected(item)}
            // onClick={() => toggleCurrentItem(item)}
            // style={{position: 'relative'}}
            // className={index <= 3 ? 'current-selected' : ''}
            extra={<ConfirmDeleteButton onOk={() => handleDeleteItem(item)} />}
          >
            {/* <div style={{position:'absolute', right: 10, top: 10}}>
              {item.id === publishedId ? <FlagFilled />
              : item === currentItem ? <FlagOutlined /> : null}
            </div> */}
            <List.Item.Meta
              description={<Space style={{ width: '100%', justifyContent: 'space-between' }}>
                {/* <Text type="secondary">{item.year} Q{item.quarter}</Text> */}
                <Text type="secondary"><small>{moment(item.reportDate).format('D MMM YYYY')}</small></Text>
                <MoneyAmount symbol="" value={item.value} />
              </Space>}
            />
          </List.Item>
        )}
      />
    </Space>
  </Container>
}

StockEpsAdminEditor.propTypes = {
  onLoadList: PropTypes.func.isRequired,
  onSaveNew: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  onSelected: PropTypes.func,
  showTime: PropTypes.bool,
  symbol: PropTypes.string.isRequired,
};

StockEpsAdminEditor.defaultProps = {
  showTime: true,
  onChange: () => { },
  onSelected: () => { },
};

export default StockEpsAdminEditor;