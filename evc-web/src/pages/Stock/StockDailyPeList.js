
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
import { listStockPe } from 'services/stockService';
import { TimeAgo } from 'components/TimeAgo';
import MoneyAmount from 'components/MoneyAmount';

const {Text} = Typography;

const Container = styled.div`
  .current-published {
    background-color: rgba(21,190,83, 0.1);
  }
`;


export const StockDailyPeList = (props) => {
  const { symbol, onLoadList, onSaveNew, onChange, onDelete, onSelected, getClassNameOnSelect, disableInput, publishedId } = props;
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

  const updateList = (list) => {
    setList(list);
    onChange(list);
  }

  const loadEntity = async () => {
    try {
      setLoading(true);
      updateList(await listStockPe(symbol));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadEntity();
  }, []);


  return <Container>
      <List
        dataSource={list}
        loading={loading}
        itemLayout="horizontal"
        rowKey="date"
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
          >
            <List.Item.Meta
              description={<Space style={{width: '100%', justifyContent: 'space-between'}}>
              {/* <Text type="secondary">{item.year} Q{item.quarter}</Text> */}
              <TimeAgo value={item.date} showTime={false} showAgo={false} direction="horizontal"/>
              {item.pe === null ? 'N/A' : <Space>
                <MoneyAmount symbol="" value={item.pe}/>
                <Text>({(+item.peLo).toFixed(2)} ~ {(+item.peHi).toFixed(2)})</Text>
              </Space>}
            </Space>}
            />
          </List.Item>
        )}
      />
  </Container>
}

StockDailyPeList.propTypes = {
  symbol: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSelected: PropTypes.func,
  getClassNameOnSelect: PropTypes.func,
  publishedId: PropTypes.string,
  showTime: PropTypes.bool,
  mode: PropTypes.string,
  disableInput: PropTypes.bool.isRequired,
};

StockDailyPeList.defaultProps = {
  showTime: true,
  mode: null,
  onChange: () => { },
  onSelected: () => { },
  getClassNameOnSelect: () => false,
  disableInput: false,
};
