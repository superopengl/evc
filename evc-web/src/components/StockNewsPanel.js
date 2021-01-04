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
import styled from 'styled-components';
import { MdOpenInNew } from 'react-icons/md';

const { Paragraph, Text, Title } = Typography;

const Container = styled(Space)`
width: 100%;

.ant-list-item {
  align-items: flex-start;
}
`;

const NewsImage = styled(Image)`
width: 200px;
border: 1px solid #f0f0f0;
padding: 4px;
border-radius: 4px;
margin-left: 10px;
`;

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
    <Container direction="vertical">
      <List
        loading={loading}
        dataSource={data}
        renderItem={item => (
          <List.Item
            extra={
              item.image ? <NewsImage src={item.image} /> : null
            }
          >
            {/* <a href={item.url} target="_blank" rel="noopener noreferrer"> */}
            <List.Item.Meta
              title={
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  <Title level={5} style={{ margin: 0 }}>
                    {item.headline} <IconContext.Provider value={{color: '#3273A4'}}><MdOpenInNew/></IconContext.Provider>
                  </Title>
                  <TimeAgo value={item.datetime} showAgo={false} direction="horizontal" />
                </a>
              }
              description={item.summary}
            />
            {/* </a> */}
          </List.Item>
        )}
      />
    </Container>
  );
};

StockNewsPanel.propTypes = {
  symbol: PropTypes.string.isRequired
};

StockNewsPanel.defaultProps = {
};

export default withRouter(StockNewsPanel);
