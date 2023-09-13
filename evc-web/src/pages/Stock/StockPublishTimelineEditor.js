
import React from 'react';
import { Typography, Space, Button, Table, Popover, Alert } from 'antd';
import PropTypes from 'prop-types';
import { ClockCircleOutlined } from '@ant-design/icons';
import * as _ from 'lodash';
import { NumberRangeDisplay } from 'components/NumberRangeDisplay';
import styled from 'styled-components';
import { TimeAgo } from 'components/TimeAgo';
import { ImRocket } from 'react-icons/im';
const { Text } = Typography;

const Container = styled.div`
  .current-published {
    background-color: rgba(21,190,83, 0.1);
  }
`;


export const StockPublishTimelineEditor = (props) => {
  const { onLoadList, onPublishNew, onChange, onSelected, disabled } = props;
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);
  const [publishConfirmVisible, setPublishConfirmVisible] = React.useState(false);

  const udpateList = (list) => {
    setList(list);
    onChange(list);
  }

  const loadEntity = async () => {
    try {
      setLoading(true);
      udpateList(await onLoadList());
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
      udpateList(await onLoadList());
    } finally {
      setLoading(false);
    }
  }

  const columnDef = [
    {
      title: <ClockCircleOutlined />,
      dataIndex: 'createdAt',
      render: (value, item) => <TimeAgo value={value} accurate={true} />
    },
    {
      title: 'Support',
      render: (value, item) => <Space size="small" direction="vertical">
      <NumberRangeDisplay lo={item.supportLo} hi={item.supportHi} loTrend={item.supportLoTrend} hiTrend={item.supportHiTrend}/>
      </Space>
    },
    {
      title: 'Resistance',
      render: (value, item) =>  <Space size="small" direction="vertical">
        <NumberRangeDisplay lo={item.resistanceLo} hi={item.resistanceHi} loTrend={item.resistanceLoTrend} hiTrend={item.resistanceHiTrend}/>
        </Space>
    },
    {
      title: 'Value',
      render: (value, item) => <NumberRangeDisplay lo={item.fairValueLo} hi={item.fairValueHi} loTrend={item.fairValueLoTrend} hiTrend={item.fairValueHiTrend} />
    },
  ];


  const handleVisibleChange = visible => {
    setPublishConfirmVisible(visible);
  }

  return <Container>
    <Space size="small" direction="vertical" style={{ width: '100%' }}>
      {disabled && <Alert message="Please setup Fair Value, Support and Resistance before publishing." type="warning" showIcon />}
      <Popover
        title="Publish with the latest information?"
        trigger="click"
        visible={publishConfirmVisible && !disabled}
        onVisibleChange={handleVisibleChange}
        content={<Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={() => setPublishConfirmVisible(false)} disabled={loading}>Cancel</Button>
          <Button style={{ marginLeft: 10 }}
            type="primary"
            onClick={handlePublishNew}
            disabled={loading}>Yes, publish</Button>
        </Space>}
      >
        <Button type="primary"
          disabled={disabled || loading || publishConfirmVisible}
          icon={<ImRocket style={{ position: 'relative', left: -2, top: 3, marginRight: 6 }} />}
        >
          Publish New
          </Button>
      </Popover>
      <Table
        columns={columnDef}
        locale={{ emptyText: ' ' }}
        size="small"
        pagination={false}
        dataSource={list}
        rowKey="id"
        onRow={(item, index) => {
          return {
            onClick: () => onSelected(item),
            // onMouseOver: () => onSelected(item)
          }
        }}
      />
    </Space>
  </Container>
}

StockPublishTimelineEditor.propTypes = {
  onLoadList: PropTypes.func.isRequired,
  onPublishNew: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  onSelected: PropTypes.func,
  disabled: PropTypes.bool.isRequired,
};

StockPublishTimelineEditor.defaultProps = {
  onChange: () => { },
  onSelected: () => { },
  disabled: false
};
