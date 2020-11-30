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

  const { data, search, loading: propLoading } = props;

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(propLoading);
  const [text, setText] = React.useState(search);


  React.useEffect(() => {
    setList(data);
    setText(search);
    setLoading(setLoading);
  }, [data, search, propLoading]);

  return (
    <List
      grid={{
        gutter: 10,
        xs: 2,
        sm: 3,
        md: 3,
        lg: 4,
        xl: 5,
        xxl: 6,
      }}
      size="small"
      dataSource={list}
      loading={loading}
      renderItem={stock => (
        <List.Item>
          <StockInfoCard 
          value={stock}
          hoverable
          onClick={() => props.history.push(`/stock/${stock.symbol}`)}
          />
        </List.Item>
      )}
    />
  )

};

StockList.propTypes = {
  data: PropTypes.array.isRequired,
  search: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
};

StockList.defaultProps = {
  search: '',
  loading: false
};

export default withRouter(StockList);
