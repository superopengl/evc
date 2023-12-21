
import React from 'react';
import { List, Typography, Space, Button, Tooltip, Alert, Modal, Form, Input } from 'antd';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import MoneyAmount from 'components/MoneyAmount';
import styled from 'styled-components';
import { StockEpsInput } from './StockEpsInput';
import { ConfirmDeleteButton } from './ConfirmDeleteButton';
import { syncStockEps, factorStockEps } from 'services/stockService';
import { EditOutlined, SyncOutlined } from '@ant-design/icons';
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
  const [bulkEditVisible, setBulkEditVisible] = React.useState(false);
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

  const handleBulkUpdateEps = () => {
    setBulkEditVisible(true);
  }

  const handleSubmitBulkEdit = async (values) => {
    const { factor } = values;
    try {
      setLoading(true);
      await factorStockEps(props.symbol, factor);
      loadEntity();
    } finally {
      setBulkEditVisible(false);
      setLoading(false);
    }
  }

  return <Container>
    <Space size="small" direction="vertical" style={{ width: '100%' }}>
      <Alert description={<>
        It's required to have at least 6 EPS values (back to one and half years ago) to calculate fair values.<br />
        Manually adding EPS value is a heavy operation as it will cause system to recalculate many values like PE90 and fair values.
      </>}
        type="info"
        showIcon
      />
      <Space size="small" style={{ width: '100%', justifyContent: 'space-between' }}>
        <StockEpsInput onSave={handleSave} disabled={loading} />
        <Space>
          <Tooltip title="Bulk update" placement="topRight">
            <Button disabled={loading} onClick={() => handleBulkUpdateEps()} loading={loading} icon={<EditOutlined />}></Button>
          </Tooltip>
          <Tooltip title="Fetch last 8 EPS from AlphaVantage" placement="topRight">
            <Button type="primary" disabled={loading} onClick={() => handleSyncEps()} loading={loading} icon={<SyncOutlined />}></Button>
          </Tooltip>
        </Space>
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
                <Text type="secondary"><small>{moment(item.reportDate).format('D MMM YYYY')}</small></Text>
                <MoneyAmount symbol="" value={item.value} digital={4} />
              </Space>}
            />
          </List.Item>
        )}
      />
    </Space>
    <Modal
      visible={bulkEditVisible}
      title="Bulk edit EPS values"
      closable={true}
      maskClosable
      destroyOnClose
      width={300}
      footer={null}
      onOk={() => setBulkEditVisible(false)}
      onCancel={() => setBulkEditVisible(false)}
    >
      <Form onFinish={handleSubmitBulkEdit}>
        <Form.Item
          label={<>Factor <Text type="secondary">(value &times; factor = newValue)</Text></>}
          name="factor"
          rules={[{
            required: true,
            validator: (rule, value) => {
              const num = +value;
              if (num === 1) {
                return Promise.reject('Cannot be 1');
              }
              if (num < 0) {
                return Promise.reject('Must be a positive number');
              }
              if (num > 0) {
                return Promise.resolve(num);
              }
              return Promise.reject('Not a valid number');
            },
          }]}>
          <Input style={{ textAlign: 'center' }} placeholder="Greater than 0, but not 1" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" block htmlType="submit">Submit</Button>
        </Form.Item>
      </Form>
    </Modal>
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