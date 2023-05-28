
import React from 'react';
import { List, Typography, Space, Button, Modal } from 'antd';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import { PushpinFilled, PushpinOutlined, EllipsisOutlined, CheckOutlined,FlagFilled, FlagOutlined, DeleteOutlined } from '@ant-design/icons';
import * as _ from 'lodash';
import MoneyAmount from 'components/MoneyAmount';
import { NumberRangeInput } from 'components/NumberRangeInput';
import { NumberRangeDisplay } from 'components/NumberRangeDisplay';
import { AiTwotonePushpin } from 'react-icons/ai';
import styled from 'styled-components';
import { StockEpsInput } from './StockEpsInput';
import { ConfirmDeleteButton } from './ConfirmDeleteButton';

const {Text} = Typography;

const Container = styled.div`
  .current-published {
    background-color: rgba(21,190,83, 0.1);
  }
`;


export const StockEpsTimelineEditor = (props) => {
  const { onLoadList, onSaveNew, onDelete, onChange, onSelected, getClassNameOnSelect } = props;
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);
  const [currentItem, setCurrentItem] = React.useState();


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
      await onDelete(item.id);
      updateList(await onLoadList());
    } finally {
      setLoading(false);
    }
  }


  return <Container>
    <Space size="small" direction="vertical" style={{ width: '100%' }}>
      <StockEpsInput onSave={handleSave} disabled={loading} />
      <List
        dataSource={list}
        loading={loading}
        itemLayout="horizontal"
        rowKey="id"
        size="small"
        locale={{emptyText: ' '}}
        renderItem={(item, index) => (
          <List.Item
            onClick={() => onSelected(item)}
            // onClick={() => toggleCurrentItem(item)}
            // style={{position: 'relative'}}
            // className={index <= 3 ? 'current-selected' : ''}
            className={getClassNameOnSelect(item)}
            extra={<ConfirmDeleteButton onOk={() => handleDeleteItem(item)} />}
          >
            {/* <div style={{position:'absolute', right: 10, top: 10}}>
              {item.id === publishedId ? <FlagFilled />
              : item === currentItem ? <FlagOutlined /> : null}
            </div> */}
            <List.Item.Meta
              description={<Space>
                <Text type="secondary">{item.year} Q{item.quarter}</Text>
                <MoneyAmount value={item.value} showSymbol={false}/>
              </Space>}
            />
          </List.Item>
        )}
      />
    </Space>
  </Container>
}

StockEpsTimelineEditor.propTypes = {
  onLoadList: PropTypes.func.isRequired,
  onSaveNew: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  onSelected: PropTypes.func,
  getClassNameOnSelect: PropTypes.func,
  showTime: PropTypes.bool,
};

StockEpsTimelineEditor.defaultProps = {
  showTime: true,
  onChange: () => {},
  onSelected: () => { },
  getClassNameOnSelect: () => false,
};
