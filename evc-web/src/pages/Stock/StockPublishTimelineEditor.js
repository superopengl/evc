
import React from 'react';
import { Modal, Typography, Space, Button, Table, Popover } from 'antd';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import { PushpinFilled, PushpinOutlined, EllipsisOutlined, CheckOutlined, FlagFilled, FlagOutlined, DeleteOutlined } from '@ant-design/icons';
import * as _ from 'lodash';
import MoneyAmount from 'components/MoneyAmount';
import { NumberRangeInput } from 'components/NumberRangeInput';
import { NumberRangeDisplay } from 'components/NumberRangeDisplay';
import { AiTwotonePushpin } from 'react-icons/ai';
import styled from 'styled-components';
import { StockEpsInput } from './StockEpsInput';
import { ConfirmDeleteButton } from './ConfirmDeleteButton';
import { TimeAgo } from 'components/TimeAgo';

const { Text } = Typography;

const Container = styled.div`
  .current-published {
    background-color: rgba(21,190,83, 0.1);
  }
  .current-selected {
    background-color: rgba(250, 140, 22, 0.1);
  }
`;


export const StockPublishTimelineEditor = (props) => {
  const { onLoadList, onPublishNew } = props;
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);
  const [publishConfirmVisible, setPublishConfirmVisible] = React.useState(false);

  const loadEntity = async () => {
    try {
      setLoading(true);
      setList(await onLoadList());
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadEntity();
  }, []);

  const handlePublishNew = async () => {
    try {
      setLoading(true);
      await onPublishNew();
      setPublishConfirmVisible(false);
      setList(await onLoadList());
    } finally {
      setLoading(false);
    }
  }

  const columnDef = [
    {
      title: 'Published At',
      dataIndex: 'createdAt',
      render: (value, item) => <TimeAgo value={value} accurate={true} />
    },
    {
      title: 'Support',
      dataIndex: 'support',
      render: (value, item) => <NumberRangeDisplay value={value} showTime={false} />
    },
    {
      title: 'Resistance',
      dataIndex: 'resistance',
      render: (value, item) => <NumberRangeDisplay value={value} showTime={false} />
    },
    {
      title: 'Value',
      dataIndex: 'value',
      render: (value, item) => <NumberRangeDisplay value={value} showTime={false} />
    },
  ];


  const handleVisibleChange = visible => {
    setPublishConfirmVisible(visible);
  }

  return <Container>
    <Space size="small" direction="vertical" style={{ width: '100%' }}>
      <Popover
        title="Publish with the latest information?"
        trigger="click"
        visible={publishConfirmVisible}
        onVisibleChange={handleVisibleChange}
        content={<Space style={{width: '100%', justifyContent: 'flex-end'}}>
          <Button onClick={() => setPublishConfirmVisible(false)} disabled={loading}>Cancel</Button>
          <Button style={{ marginLeft: 10 }}
            type="primary"
            onClick={handlePublishNew}
            disabled={loading}>Yes, publish</Button>
        </Space>}
      >

        <Button type="primary" disabled={loading || publishConfirmVisible}>Publish New</Button>
      </Popover>
      <Table
        columns={columnDef}
        locale={{ emptyText: ' ' }}
        size="small"
        pagination={false}
        dataSource={list}
        rowKey="id"
      />
    </Space>
  </Container>
}

StockPublishTimelineEditor.propTypes = {
  onLoadList: PropTypes.func.isRequired,
  onPublishNew: PropTypes.func.isRequired,
};

StockPublishTimelineEditor.defaultProps = {
};
