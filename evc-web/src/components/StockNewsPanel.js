import React from 'react';
import PropTypes from 'prop-types';
import { List, Typography, Space, Image, Tooltip, Modal, Tabs } from 'antd';
import { withRouter } from 'react-router-dom';
import { DeleteOutlined, EyeOutlined, EyeInvisibleOutlined, LockFilled } from '@ant-design/icons';
import StockInfoCard from './StockInfoCard';
import { StockName } from './StockName';
import { FaCrown } from 'react-icons/fa';
import { IconContext } from "react-icons";
import { getStockNews } from 'services/stockService';
import { TimeAgo } from 'components/TimeAgo';
import { Loading } from './Loading';
const { Paragraph, Text, Title } = Typography;


const StockNewsPanel = (props) => {

  const { symbol } = props;
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      setData(await getStockNews(symbol));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, []);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <List
        loading={loading}
        dataSource={data}
        renderItem={item => (
          <List.Item
            extra={
              item.image ? <Image src={item.image} /> : null
            }
          >
            {/* <a href={item.url} target="_blank" rel="noopener noreferrer"> */}
            <List.Item.Meta
              title={<Space>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  <Title level={5} style={{margin: 0}}>
                    {item.headline}
                  </Title>
                </a>
                <TimeAgo value={item.datetime} showAgo={false} direction="horizontal" />
              </Space>}
              description={item.summary}
            />
            {/* </a> */}
          </List.Item>
        )}
      />
    </Space>
  );
};

StockNewsPanel.propTypes = {
  symbol: PropTypes.string.isRequired
};

StockNewsPanel.defaultProps = {
};

export default withRouter(StockNewsPanel);
