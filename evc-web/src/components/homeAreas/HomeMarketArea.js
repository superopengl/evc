import React from 'react';
import HomeRowArea from "./HomeRowArea";
import styled from 'styled-components';
import { Typography, Row, Col, Space } from 'antd';
import { IconContext } from "react-icons";
import { GiGraduateCap } from 'react-icons/gi';
import { BsLightning } from 'react-icons/bs';
import { AiOutlineGlobal } from 'react-icons/ai';
import { BiDollar } from 'react-icons/bi';
import { listHotStock, getMarketGainers, getMarketMostActive, getMarketLosers } from 'services/stockService';
import StockMostPanel from 'components/StockMostPanel';
import StockMostSearched from 'components/StockMostSearched';

const { Title, Paragraph } = Typography;

const Container = styled.div`
justify-content: center;
margin-bottom: 0rem;
width: 100%;
// text-align: center;
padding: 1.5rem 1rem;
// background: #fafafa;
`;

const InnerContainer = styled.div`
margin-left: auto;
margin-right: auto;
width: 100%;
// max-width: 1200px;

.ant-col {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}
`;


const HomeMarketArea = props => {
  const span = {
    xs: 24,
    sm: 24,
    md: 12,
    lg: 6,
    xl: 6,
    xxl: 6
  };

  return (
    <Container>
      <InnerContainer>
        <Row gutter={30}>
          <Col {...span}>
            <StockMostSearched onFetch={listHotStock} title="most searched" />
          </Col>
          <Col {...span}>
            <StockMostPanel onFetch={getMarketMostActive} title="Most Actives" />
          </Col>
          <Col {...span}>
            <StockMostPanel onFetch={getMarketGainers} title="Gainers" />
          </Col>
          <Col {...span}>
            <StockMostPanel onFetch={getMarketLosers} title="Losers" />
          </Col>
        </Row>
      </InnerContainer>
    </Container>
  );
}

HomeMarketArea.propTypes = {};

HomeMarketArea.defaultProps = {};

export default HomeMarketArea;
