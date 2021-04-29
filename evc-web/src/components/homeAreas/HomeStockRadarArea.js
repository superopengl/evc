import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Button, Space, Alert } from 'antd';
import styled from 'styled-components';
import StockRadarPage from 'pages/Stock/StockRadarPage';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

const { Title, Text, Paragraph } = Typography;

const Container = styled.div`
justify-content: center;
margin-bottom: 0rem;
width: 100%;
text-align: center;
padding: 4rem 1rem;
// background: #7DD487;
// background-image: linear-gradient(150deg, #55B0D4, #55B0D4 25%, #89DFF1 25%, #89DFF1 50%, #7DD487 50%, #7DD487 75%, #57BB60 75%, #57BB60 100%);
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

max-width: 1600px;
`;


export const HomeStockRadarArea = props => {
  const { onSymbolClick } = props;
  return (
    <Container>
      <Space direction="vertical" size="large" style={{ width: '100%', marginBottom: 30 }}>
        <Title><FormattedMessage id="menu.stockRadar" /></Title>
        <Alert 
        type="success" 
        description={<>
          <Paragraph type="success">
            Stock Radar, saving time and improving efficiency, selecting valuable investing targets.
            Scanning assets based on your specified conditions helps you find what you need in stock.
            Our stock radar screens both fundamental and technical aspects, e.g., whether included as components of stock indexes, in what industries and sectors, whether they are within valuations, etc. This helps save time, improve the searching efficiency, and find high-quality target companies making attractive money.
        </Paragraph>
        <Paragraph type="secondary">
            This is Stock Radar preview. Full feature is available after sign up
        </Paragraph>
        <Link to="/signup">
          <Button type="primary" style={{ minWidth: 140 }}>
            <FormattedMessage id="menu.signUpNow" />
          </Button>
        </Link>
        </>} />


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