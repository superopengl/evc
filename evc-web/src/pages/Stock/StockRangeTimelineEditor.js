
import React from 'react';
import { List, Typography, Space, Button, Modal } from 'antd';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import { PushpinFilled, PushpinOutlined, EllipsisOutlined, DeleteOutlined, FlagFilled, FlagOutlined } from '@ant-design/icons';
import * as _ from 'lodash';
import { NumberRangeInput } from 'components/NumberRangeInput';
import { NumberRangeDisplay } from 'components/NumberRangeDisplay';
import { AiTwotonePushpin } from 'react-icons/ai';
import styled from 'styled-components';
import { Divider } from 'antd';
import { ConfirmDeleteButton } from './ConfirmDeleteButton';

const Container = styled.div`
  .current-published {
    background-color: rgba(21,190,83, 0.1);
  }

  .current-selected {
    background-color: rgba(250, 140, 22, 0.1);
  }
`;


export const StockRangeTimelineEditor = (props) => {
  const { onLoadList, onSaveNew, onChange, onDelete, clickable, showTime, publishedId } = props;
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);
  const [currentItem, setCurrentItem] = React.useState();

  const updateList = (list) => {
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

  const handleSaveSupport = async (range) => {
    try {
      setLoading(true);
      await onSaveNew(range);
      updateList(await onLoadList());
    } finally {
      setLoading(false);
    }
  }

  const toggleCurrentItem = item => {
    if (!clickable) return;
    setCurrentItem(currentItem === item ? null : item);
  }

  const handleDeleteItem = async (item) => {
    try {
      setLoading(true);
      await onDelete(item.id);
      updateList(await onLoadList());
    } finally {
      setLoading(false);
    }
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
        locale={{emptyText: ' '}}
        loadMore={list.length >= 6 && <div style={{ width: '100%', textAlign: 'center' }}>
          <Button block size="large" type="link" icon={<EllipsisOutlined />} />
        </div>}
        renderItem={item => (
          <List.Item
            onClick={() => toggleCurrentItem(item)}
            style={{ position: 'relative' }}
            className={item.id === publishedId ? 'current-published' : item === currentItem ? 'current-selected' : ''}
            extra={<ConfirmDeleteButton onOk={() => handleDeleteItem(item)} />}
          >
            {clickable && <div style={{ position: 'absolute', right: 10, top: 10 }}>
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

StockRangeTimelineEditor.propTypes = {
  onLoadList: PropTypes.func.isRequired,
  onSaveNew: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onItemClick: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  publishedId: PropTypes.string,
  showTime: PropTypes.bool,
  mode: PropTypes.string,
  clickable: PropTypes.bool
};

StockRangeTimelineEditor.defaultProps = {
  showTime: true,
  mode: null,
  clickable: false,
  onChange: () => { },
  onDelete: () => { }
};
