
import React from 'react';
import { Typography, DatePicker, Table, Form, Button, Space } from 'antd';
import PropTypes from 'prop-types';
import { isNil } from 'lodash';
import styled from 'styled-components';
import { Tag } from 'antd';
import { ConfirmDeleteButton } from './ConfirmDeleteButton';
import moment from 'moment';
import { NumberRangeInput } from 'components/NumberRangeInput';
import {
  listStockFairValue,
} from 'services/stockService';
import ReactDOM from 'react-dom';
import { CheckOutlined } from '@ant-design/icons';
import { from } from 'rxjs';

const { Text } = Typography;

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

.latest-pe90-row {
  background-color: #57BB6033;
  font-weight: 600;
}
`;

export const StockFairValueEditor = (props) => {
  const { symbol, onLoadList, onSaveNew, onDelete } = props;
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

  const updateList = list => {
    setList(list);
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
    const load$ = from(load()).subscribe();

    return () => {
      load$.unsubscribe();
    }
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
    return isNil(value) ? <Text type="danger"><small>n/a</small></Text> : (+value)?.toLocaleString();
  }


  const handleSaveFairValue = async (values) => {
    const { reportDate, range } = values;
    const [lo, hi] = range;
    await onSaveNew({
      reportDate,
      lo,
      hi
    });
  }

  const handleRowClassName = (item, index) => {
    return item.isLatest ? 'latest-pe90-row' : null;
  }

  const columns = [
    {
      title: 'Report Date',
      dataIndex: 'reportDate',
      render: (value, item) => <Text type="secondary">
        {moment(value, 'YYYY-MM-DD').format('D MMM YYYY')}
      </Text>
    },
    {
      title: 'TtmEPS',
      dataIndex: 'ttmEps',
      render: (value, item) => {
        return item.id ? null : displayNumber(value)
      },
    },
    {
      title: 'PE',
      dataIndex: 'pe',
      render: (value, item) => {
        return item.id ? null : displayNumber(value)
      },
    },
    {
      title: 'PE90 Avg',
      dataIndex: 'pe90Avg',
      render: (value, item, index) => {
        return item.id ? null : displayNumber(value)
      },
    },
    {
      title: 'PE90 StdDev',
      dataIndex: 'pe90StdDev',
      render: (value, item, index) => {
        return item.id ? null : displayNumber(value)
      },
    },
    {
      title: 'PE90 Avg±SD',
      render: (value, item, index) => {
        return item.id ? null : <>{displayNumber(item.peLo)} ~ {displayNumber(item.peHi)}</>
      },
    },
    {
      title: 'Fair Value',
      render: (value, item, index) => {
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
      loading={loading}
      pagination={false}
      style={{ width: '100%' }}
      scroll={{ y: 300 }}
      rowClassName={handleRowClassName}
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
