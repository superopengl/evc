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
import { BiSpaceBar } from 'react-icons/bi';

const { Paragraph, Text, Title } = Typography;

const Container = styled(Space)`
width: 100%;

.ant-list-item {
  align-items: flex-start;
  border: none;
}
`;

const NewsImage = styled(Image)`
width: 200px;
border: 1px solid #f0f0f0;
padding: 4px;
border-radius: 4px;
margin-left: 10px;
`;

const StyledListItem = styled(List.Item)`
&:hover {
  cursor: pointer;

  .news-title {
    color: #3273A4;
    text-decoration: underline;
  }
}
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

  const handleOpenNews = (url) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  }

  return (
    <Container direction="vertical">
      <List
        loading={loading}
        dataSource={data}
        renderItem={item => (
          <StyledListItem
            onClick={() => handleOpenNews(item.url)}
          >
            {/* <a href={item.url} target="_blank" rel="noopener noreferrer"> */}
            <List.Item.Meta
              avatar={item.image ? <NewsImage src={item.image} /> : null}
              title={<>
                <TimeAgo value={item.datetime} showAgo={false} direction="horizontal" />
                <Space size="small" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Title level={4} style={{ margin: 0 }} className="news-title">
                    {item.headline}
                  </Title>
                  <div style={{ position: 'relative', top: 4 }}>
                    <IconContext.Provider value={{ color: '#3273A4', size: 20 }}><MdOpenInNew /></IconContext.Provider>
                  </div>
                </Space>
              </>
              }
              description={item.summary}
            />
            {/* </a> */}
          </StyledListItem>
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
