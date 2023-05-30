
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
`;


export const StockRangeTimelineEditor = (props) => {
  const { onLoadList, onSaveNew, onChange, onDelete, onSelected, getClassNameOnSelect, showTime, publishedId } = props;
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

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
            onClick={() => onSelected(item)}
            style={{ position: 'relative' }}
            className={getClassNameOnSelect(item)}
            extra={<ConfirmDeleteButton onOk={() => handleDeleteItem(item)} />}
          >
            <List.Item.Meta
              description={<NumberRangeDisplay lo={item.lo} hi={item.hi} loTrend={item.loTrend} hiTrend={item.hiTrend} time={item.createdAt} />}
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
  onChange: PropTypes.func.isRequired,
  onSelected: PropTypes.func,
  getClassNameOnSelect: PropTypes.func,
  publishedId: PropTypes.string,
  showTime: PropTypes.bool,
  mode: PropTypes.string,
};

StockRangeTimelineEditor.defaultProps = {
  showTime: true,
  mode: null,
  onChange: () => { },
  onDelete: () => { },
  onSelected: () => { },
  getClassNameOnSelect: () => false,
};
