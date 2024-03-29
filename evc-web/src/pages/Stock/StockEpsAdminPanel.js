
import React from 'react';
import { List, Typography, Space, Button, Tooltip, Alert, Tag, Badge } from 'antd';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import MoneyAmount from 'components/MoneyAmount';
import styled from 'styled-components';
import { StockEpsInput } from './StockEpsInput';
import { ConfirmDeleteButton } from './ConfirmDeleteButton';
import { syncStockEps } from 'services/stockService';
import { SyncOutlined } from '@ant-design/icons';
import { from } from 'rxjs';
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
    const load$ = from(loadEntity()).subscribe();

    return () => {
      load$.unsubscribe();
    }
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
        It's required to have at least 16 EPS values (back to one and half years ago) to calculate fair values.<br />
        Manually adding EPS value is a heavy operation as it will cause system to recalculate many values like PE90 and fair values.
      </>}
        type="info"
        showIcon
      />
      <Space size="small" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <StockEpsInput onSave={handleSave} disabled={loading} />
        <Tooltip title="Fetch last 16 EPS from AlphaVantage" placement="topRight">
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
            extra={<ConfirmDeleteButton onOk={() => handleDeleteItem(item)} />}
          >
            <List.Item.Meta
              description={<Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Text type="secondary"><small>{moment(item.reportDate).format('D MMM YYYY')}</small>
                  {item.source === 'evc' && <Tooltip title="Manually input EPS"><Badge status="success" style={{ marginLeft: 4 }} /></Tooltip>}
                </Text>
                <MoneyAmount symbol="" value={item.value} digital={4} />
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