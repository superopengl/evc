
import React from 'react';
import { Typography, DatePicker, Table, Form, Button, Space } from 'antd';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import styled from 'styled-components';
import { Tag } from 'antd';
import { ConfirmDeleteButton } from './ConfirmDeleteButton';
import { TimeAgo } from 'components/TimeAgo';
import moment from 'moment';
import { NumberRangeInput } from 'components/NumberRangeInput';
import {
  listStockSupport, saveStockSupport, deleteStockSupport,
  listStockResistance, saveStockResistance, deleteStockResistance,
  listStockEps, saveStockEps, deleteStockEps,
  listStockFairValue, saveStockFairValue, deleteStockFairValue,
} from 'services/stockService';
import ReactDOM from 'react-dom';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const Container = styled.div`
.ant-table-thead {
  .ant-table-cell {
    background-color: transparent;
    color: rgba(0,0,0,0.5);
    font-size: 0.8rem;
  }
}

.ant-form-item-explain-error {
  display: none !important;
}

`;

export const StockFairValueEditor = (props) => {
  const { symbol, onLoadList, onChange, onDelete } = props;
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

  const updateList = list => {
    setList(list);
    onChange(list);
  }

  const load = async () => {
    try {
      const list = await listStockFairValue(symbol);
      ReactDOM.unstable_batchedUpdates(() => {
        setList(list);
        setLoading(false);
      })
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);


  const handleDeleteSpecialFairValue = async (specialFairValueId) => {
    try {
      setLoading(true);
      await onDelete(specialFairValueId);
      updateList(await onLoadList());
    } finally {
      setLoading(false);
    }
  }

  const displayNumber = value => {
    return _.isNil(value) ? <Text type="danger"><small>n/a</small></Text> : (+value).toLocaleString();
  }


  const handleSaveFairValue = async (values) => {
    const { reportDate, range } = values;
    const [lo, hi] = range;
    await saveStockFairValue(symbol, {
      reportDate,
      lo,
      hi
    });
  }

  const columns = [
    {
      title: 'Report Date',
      dataIndex: 'reportDate',
      render: (value) => <Text type="secondary"><small>
        {moment(value, 'YYYY-MM-DD').format('D MMM YYYY')}
      </small></Text>
    },
    {
      title: 'TtmEPS',
      dataIndex: 'ttmEps',
      render: (value, item) => {
        return item.id ? null : displayNumber(value)
      },
    },
    {
      title: 'PE90',
      dataIndex: 'pe',
      render: (value, item) => {
        return item.id ? null : displayNumber(value)
      },
    },
    {
      title: 'Fair Value',
      render: (value, item) => {
        const { id, fairValueLo, fairValueHi } = item;
        return fairValueLo ? <Space>
          {displayNumber(fairValueLo)} ~ {displayNumber(fairValueHi)}
          {!!id && <Tag>Special</Tag>}
          {!!id && <ConfirmDeleteButton onOk={() => handleDeleteSpecialFairValue(id)} />}
        </Space> : displayNumber()
      },
    },
  ];


  return <Container>
    <Form
      layout="inline"
      onFinish={handleSaveFairValue}
    >
      <Form.Item name="reportDate" rules={[{ required: true, message: 'xxx', type: 'date' }]}>
        <DatePicker placeholder="Report date" style={{ width: 150 }} />
      </Form.Item>
      <Form.Item name="range" rules={[{ required: true, message: 'yyy' }]}>
        <NumberRangeInput showSave={false} disabled={loading} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" icon={<CheckOutlined />} />
      </Form.Item>
      {/* <Form.Item>
        <Button icon={<CloseOutlined />} />
      </Form.Item> */}
    </Form>
    <Table
      columns={columns}
      dataSource={list}
      size="small"
      rowKey={item => item.id ?? item.reportDate}
      rowClassName={() => 'editable-row'}
      loading={loading}
      pagination={false}
      style={{ width: '100%' }}
    />
  </Container>
}

StockFairValueEditor.propTypes = {
  onChange: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
  showTime: PropTypes.bool,
  symbol: PropTypes.string.isRequired,
};

StockFairValueEditor.defaultProps = {
  showTime: true,
  onChange: () => { },
  onDelete: () => { },
};
