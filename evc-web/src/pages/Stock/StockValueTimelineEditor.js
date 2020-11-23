
import React from 'react';
import { List, Typography, Space, Button, Modal } from 'antd';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import { PushpinFilled, PushpinOutlined, EllipsisOutlined, DeleteOutlined, FlagFilled, FlagOutlined } from '@ant-design/icons';
import * as _ from 'lodash';
import { TimeAgo } from './TimeAgo';
import MoneyAmount from './MoneyAmount';
import { NumberRangeInput } from 'components/NumberRangeInput';
import { NumberRangeDisplay } from 'components/NumberRangeDisplay';
import { AiTwotonePushpin } from 'react-icons/ai';
import styled from 'styled-components';
import { Switch } from 'antd';
import { Tag } from 'antd';

const { Text } = Typography;

const Container = styled.div`
  .current-published {
    background-color: rgba(21,190,83, 0.1);
  }

  .current-selected {
    background-color: rgba(250, 140, 22, 0.1);
  }
`;


export const StockValueTimelineEditor = (props) => {
  const { onLoadList, onSaveNew, onChange, onDelete, clickable, showTime, publishedId, sourceEps, sourcePe } = props;
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);
  const [currentItem, setCurrentItem] = React.useState();
  const [isSpecialFairValue, setIsSpecialFairValue] = React.useState(false);
  const [derivedValue, setDerivedValue] = React.useState({ lo: null, hi: null });

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

  React.useEffect(() => {
    const sum = _.sum(sourceEps);
    setDerivedValue({
      lo: _.isNumber(sourcePe.lo) ? sourcePe.lo * sum : null,
      hi: _.isNumber(sourcePe.hi) ? sourcePe.hi * sum : null
    });
  }, [sourceEps, sourcePe])

  const handleSave = async (range) => {
    try {
      setLoading(true);
      await onSaveNew({
        lo: range[0],
        hi: range[1],
        special: isSpecialFairValue,
        sourceEps,
        sourcePe: [sourcePe.lo, sourcePe.hi]
      });
      setIsSpecialFairValue(false);
      updateList(await onLoadList());
    } finally {
      setLoading(false);
    }
  }

  const toggleCurrentItem = item => {
    if (!clickable) return;
    setCurrentItem(currentItem === item ? null : item);
  }

  const handleSpecialFairSwitchChange = checked => {
    setIsSpecialFairValue(checked);
  }

  const handleDeleteItem = async (item) => {
    Modal.confirm({
      title: <>Delete <NumberRangeDisplay value={item} showTime={false} /></>,
      maskClosable: true,
      closable: true,
      okButtonProps: {
        danger: true
      },
      okText: 'Yes, delete',
      onOk: async () => {
        try {
          setLoading(true);
          await onDelete(item.id);
          updateList(await onLoadList());
        } finally {
          setLoading(false);
        }
      }
    })
  }

  return <Container>
    <Space size="small" direction="vertical" style={{ width: '100%' }}>
      <Space style={{ width: '100%' }}>
        <Text>Special Fair Value</Text>
        <Switch value={isSpecialFairValue} onChange={handleSpecialFairSwitchChange} />
      </Space>
      <NumberRangeInput 
        onSave={handleSave} 
        value={[derivedValue?.lo, derivedValue?.hi]}
        disabled={loading} 
        readOnly={!isSpecialFairValue} 
        allowInputNone={true}
      />
      <List
        dataSource={list}
        loading={loading}
        itemLayout="horizontal"
        rowKey="id"
        size="small"
        renderItem={item => (
          <List.Item
            onClick={() => toggleCurrentItem(item)}
            style={{ position: 'relative' }}
            className={item.id === publishedId ? 'current-published' : item === currentItem ? 'current-selected' : ''}
            extra={<Button type="link" danger icon={<DeleteOutlined/>} onClick={() => handleDeleteItem(item)} />}
          >
            {clickable && <div style={{ position: 'absolute', right: 10, top: 10 }}>
              {item.id === publishedId ? <FlagFilled />
                : item === currentItem ? <FlagOutlined /> : null}
            </div>}
            <List.Item.Meta
              description={<NumberRangeDisplay value={item} showTime={showTime} />}
            />
            {item.special ? <Tag color="gold">special</Tag> : <Tag color="blue">computed</Tag>}
          </List.Item>
        )}
      />
    </Space>
  </Container>
}

StockValueTimelineEditor.propTypes = {
  onLoadList: PropTypes.func.isRequired,
  onSaveNew: PropTypes.func.isRequired,
  onItemClick: PropTypes.func,
  onChange: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
  publishedId: PropTypes.string,
  showTime: PropTypes.bool,
  clickable: PropTypes.bool,
  sourceEps: PropTypes.array.isRequired,
  sourcePe: PropTypes.array.isRequired,
};

StockValueTimelineEditor.defaultProps = {
  showTime: true,
  mode: null,
  clickable: true,
  sourceEps: [0, 0, 0, 0],
  sourcePe: { lo: 0, hi: 0 },
  onChange: () => { },
  onDelete: () => {}
};
