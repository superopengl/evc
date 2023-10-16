
import React from 'react';
import { List, Space, Button } from 'antd';
import PropTypes from 'prop-types';
import { EllipsisOutlined } from '@ant-design/icons';
import { NumberRangeInput } from 'components/NumberRangeInput';
import { NumberRangeDisplay } from 'components/NumberRangeDisplay';
import styled from 'styled-components';
import { ConfirmDeleteButton } from './ConfirmDeleteButton';
import { TimeAgo } from 'components/TimeAgo';


const Container = styled.div`
  .current-published {
    background-color: rgba(87,187,96, 0.1);
  }
`;


export const StockRangeTimelineEditor = (props) => {
  const { onLoadList, onSaveNew, onChange, onDelete, onSelected, disableInput } = props;
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
      {!disableInput && <NumberRangeInput onSave={handleSaveSupport} disabled={loading} />}
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
            extra={<ConfirmDeleteButton onOk={() => handleDeleteItem(item)} />}
          >
            <List.Item.Meta
              description={<Space size="small">
                <TimeAgo value={item.createdAt} showAgo={false} accurate={false} />
              <NumberRangeDisplay lo={item.lo} hi={item.hi} />
              </Space>}
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
  publishedId: PropTypes.string,
  showTime: PropTypes.bool,
  mode: PropTypes.string,
  disableInput: PropTypes.bool.isRequired,
};

StockRangeTimelineEditor.defaultProps = {
  showTime: true,
  mode: null,
  onChange: () => { },
  onDelete: () => { },
  onSelected: () => { },
  disableInput: false,
};
