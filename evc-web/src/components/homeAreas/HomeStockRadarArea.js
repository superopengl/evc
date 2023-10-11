import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Button, Space } from 'antd';
import styled from 'styled-components';
import StockRadarPage from 'pages/Stock/StockRadarPage';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const Container = styled.div`
justify-content: center;
margin-bottom: 0rem;
width: 100%;
text-align: center;
padding: 4rem 1rem;
// background: #52d074;
// background-image: linear-gradient(150deg, #1cabd3, #1cabd3 25%, #5fdef1 25%, #5fdef1 50%, #52d074 50%, #52d074 75%, #17b649 75%, #17b649 100%);
`;

const InnerContainer = styled.div`
margin-left: auto;
margin-right: auto;
width: 100%;
border: 1px solid #f0f0f0;
padding: 1rem;
background: rgb(240, 242, 245);
// filter: contrast(0.6);
// transform: scale(0.8);

// max-width: 1200px;
`;


export const HomeStockRadarArea = props => {
  const { onSymbolClick } = props;
  return (
    <Container>
      <Space direction="vertical" size="large" style={{ width: '100%', marginBottom: 30 }}>
        <Title>Stock Radar - Preview</Title>
          <Text type="secondary">
            This is Stock Radar preview. 
            Full feature is available after sign up
          </Text>
          <Link to="/signup"><Button type="primary" style={{minWidth: 140}}>Sign Up Now</Button></Link>
      </Space>
      <InnerContainer>
        <StockRadarPage onItemClick={onSymbolClick} />
      </InnerContainer>
    </Container>
  )
}

HomeStockRadarArea.propTypes = {
  onSymbolClick: PropTypes.func,
};

HomeStockRadarArea.defaultProps = {
  onSymbolClick: () => { }
};

export default HomeStockRadarArea;