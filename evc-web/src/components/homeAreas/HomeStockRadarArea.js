import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Button, Space } from 'antd';
import styled from 'styled-components';
import StockRadarPage from 'pages/Stock/StockRadarPage';
import { Link } from 'react-router-dom';

const { Title } = Typography;

const Container = styled.div`
justify-content: center;
margin-bottom: 0rem;
width: 100%;
text-align: center;
padding: 4rem 1rem;
// background: #5dd982;
background-image: linear-gradient(150deg, #18b0d7, #18b0d7 25%, #67ddf0 25%, #67ddf0 50%, #5dd982 50%, #5dd982 75%, #15be53 75%, #15be53 100%);
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
          <Title level={5} style={{ fontStyle: 'italic'}}>
            This is Stock Radar preview. 
            Full feature is available after <Link to="/signup"><Button>Sign Up</Button></Link>
          </Title>
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