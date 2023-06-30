import React from 'react';
import HomeRowArea from "./HomeRowArea";
import styled from 'styled-components';
import { Typography, Row, Col, Space } from 'antd';
import { IconContext } from "react-icons";
import { GiGraduateCap } from 'react-icons/gi';
import { BsLightning } from 'react-icons/bs';
import { AiOutlineGlobal } from 'react-icons/ai';
import { BiDollar } from 'react-icons/bi';
import { getMarketGainers, getMarketMostActive, getMarketLosers } from 'services/stockService';
import StockMostPanel from 'components/StockMostPanel';

const { Title, Paragraph } = Typography;

const InfoCard = styled.div`
box-sizing: border-box;
width: 100%;
// margin-top: 2rem;
padding: 1rem;
// border: 1px solid #eeeeee;


section .ant-typography {
  text-align: left;
}
`;

const Container = styled.div`
justify-content: center;
margin-bottom: 0rem;
width: 100%;
// text-align: center;
padding: 2rem 0;
// background: #fafafa;
`;

const InnerContainer = styled.div`
margin-left: auto;
margin-right: auto;
width: 100%;
max-width: 1200px;
`;


const HomeMarketArea = props => {
  const span = {
    xs: 24,
    sm: 24,
    md: 24,
    lg: 8,
    xl: 8,
    xxl: 8
  };

  return (
    <Container>
      <InnerContainer>
        <Row gutter={30}>
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
