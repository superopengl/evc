
import React from 'react';
import { List, Typography, Space, Button } from 'antd';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import { PushpinFilled, PushpinOutlined, EllipsisOutlined, CheckOutlined,FlagFilled, FlagOutlined } from '@ant-design/icons';
import * as _ from 'lodash';
import { TimeAgo } from './TimeAgo';
import MoneyAmount from './MoneyAmount';
import { NumberRangeInput } from 'components/NumberRangeInput';
import { NumberRangeDisplay } from 'components/NumberRangeDisplay';
import { AiTwotonePushpin } from 'react-icons/ai';
import styled from 'styled-components';
import { StockEpsInput } from './StockEpsInput';

const {Text} = Typography;

const Container = styled.div`
  .current-published {
    background-color: rgba(21,190,83, 0.1);
  }
  .current-selected {
    background-color: rgba(250, 140, 22, 0.1);
  }
`;


export const StockEpsTimelineEditor = (props) => {
  const { onLoadList, onSaveNew, mode, showTime, publishedId } = props;
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

  const handleSave = async (range) => {
    try {
      setLoading(true);
      await onSaveNew(range);
      setList(await onLoadList());
    } finally {
      setLoading(false);
    }
  }

  const toggleCurrentItem = item => {
    setCurrentItem(currentItem === item ? null : item);
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
        renderItem={item => (
          <List.Item
            // onClick={() => toggleCurrentItem(item)}
            // style={{position: 'relative'}}
            // className={item.id === publishedId ? 'current-published' : item === currentItem ? 'current-selected' : ''}
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
  onItemClick: PropTypes.func,
  publishedId: PropTypes.string,
  showTime: PropTypes.bool,
  mode: PropTypes.string,
};

StockEpsTimelineEditor.defaultProps = {
  showTime: true,
  mode: null
};
