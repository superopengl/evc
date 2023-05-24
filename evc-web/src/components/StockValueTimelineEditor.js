
import React from 'react';
import { List, Typography, Space, Button } from 'antd';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import { PushpinFilled, PushpinOutlined, EllipsisOutlined, CheckOutlined, FlagFilled, FlagOutlined } from '@ant-design/icons';
import * as _ from 'lodash';
import { TimeAgo } from './TimeAgo';
import MoneyAmount from './MoneyAmount';
import { NumberRangeInput } from 'components/NumberRangeInput';
import { NumberRangeDisplay } from 'components/NumberRangeDisplay';
import { AiTwotonePushpin } from 'react-icons/ai';
import styled from 'styled-components';

const Container = styled.div`
  .current-published {
    background-color: rgba(21,190,83, 0.1);
  }

  .current-selected {
    background-color: rgba(250, 140, 22, 0.1);
  }
`;


export const StockValueTimelineEditor = (props) => {
  const { onLoadList, onSaveNew, clickable, showTime, publishedId } = props;
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);
  const [currentItem, setCurrentItem] = React.useState();

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

  const handleSaveSupport = async (range) => {
    try {
      setLoading(true);
      await onSaveNew(range);
      setList(await onLoadList());
    } finally {
      setLoading(false);
    }
  }

  const toggleCurrentItem = item => {
    if(!clickable) return;
    setCurrentItem(currentItem === item ? null : item);
  }

  return <Container>
    <Space size="small" direction="vertical" style={{ width: '100%' }}>
      <NumberRangeInput onSave={handleSaveSupport} disabled={loading} />
      <List
        dataSource={list}
        loading={loading}
        itemLayout="horizontal"
        rowKey="id"
        size="small"
        renderItem={item => (
          <List.Item
            onClick={() => toggleCurrentItem(item)}
            style={{position: 'relative'}}
            className={item.id === publishedId ? 'current-published' : item === currentItem ? 'current-selected' : ''}
          >
            {clickable && <div style={{position:'absolute', right: 10, top: 10}}>
              {item.id === publishedId ? <FlagFilled />
              : item === currentItem ? <FlagOutlined /> : null}
            </div>}
            <List.Item.Meta
              description={<NumberRangeDisplay value={item} showTime={showTime} />}
            />
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
  publishedId: PropTypes.string,
  showTime: PropTypes.bool,
  mode: PropTypes.string,
  clickable: PropTypes.bool
};

StockValueTimelineEditor.defaultProps = {
  showTime: true,
  mode: null,
  clickable: true,
};
