import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Row, Col, Modal, Select, Space, Table, Card, Typography } from 'antd';
import { TimeAgo } from 'components/TimeAgo';
import { countUnreadMessage } from 'services/messageService';
import { GlobalContext } from 'contexts/GlobalContext';
import { withRouter } from 'react-router-dom';
import { Loading } from './Loading';
import Highlighter from "react-highlight-words";
import { Link } from 'react-router-dom';
import { DeleteOutlined, EditOutlined, SearchOutlined, SyncOutlined, PlusOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { List } from 'antd';
import { StockName } from './StockName';
import { NumberRangeDisplay } from './NumberRangeDisplay';
import { ImRocket } from 'react-icons/im';
import StockInfoCard from './StockInfoCard';

const { Text, Title, Paragraph } = Typography;

const StockList = (props) => {

  const { data, loading, onItemClick } = props;

  return (
    <List
      grid={{
        gutter: 10,
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4,
        xl: 4,
        xxl: 6,
      }}
      size="small"
      loading={loading}
      dataSource={data}
      renderItem={stock => (
        <List.Item>
          <StockInfoCard 
          value={stock}
          hoverable
          onClick={() => onItemClick(stock)}
          />
        </List.Item>
      )}
    />
  )

};

StockList.propTypes = {
  data: PropTypes.array.isRequired,
  onItemClick: PropTypes.func,
};

StockList.defaultProps = {
  onItemClick: () => {}
};

export default withRouter(StockList);
