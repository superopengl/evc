import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Space, Button, Tooltip, Modal, Tabs } from 'antd';
import { withRouter } from 'react-router-dom';
import { DeleteOutlined, EyeOutlined, EyeInvisibleOutlined, LockFilled } from '@ant-design/icons';
import StockInfoCard from './StockInfoCard';
import { StockName } from './StockName';
import { FaCrown } from 'react-icons/fa';
import { IconContext } from "react-icons";
import { getStockInsider } from 'services/stockService';
import { Loading } from './Loading';
const { Paragraph, Text } = Typography;


const StockInsiderPanel = (props) => {

  const { symbol } = props;
  const [data, setData] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      setData(await getStockInsider(symbol));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, []);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Loading loading={loading}>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </Loading>
    </Space>
  );
};

StockInsiderPanel.propTypes = {
  symbol: PropTypes.string.isRequired
};

StockInsiderPanel.defaultProps = {
};

export default withRouter(StockInsiderPanel);
