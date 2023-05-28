import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Form, Button, Input } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { withRouter } from 'react-router-dom';
import * as queryString from 'query-string';
import StockForm from './StockForm';
import { GlobalContext } from 'contexts/GlobalContext';
import { Loading } from 'components/Loading';
import { Modal } from 'antd';
import StockTagSelect from 'components/StockTagSelect';

const { Title, Paragraph, Link } = Typography;

const ContainerStyled = styled.div`
margin: 6rem auto 2rem auto;
padding: 0 1rem;
width: 100%;
// max-width: 400px;
`;

const StyledTitleRow = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 width: 100%;
 margin-bottom: 1rem;
`

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;


const StockPage = props => {
  const symbol = props.match.params.symbol;

  const handlePostSave = () => {
    props.history.goBack();
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        {/* <StyledTitleRow>
          <Title level={2} style={{ margin: 'auto' }}>Stock</Title>
        </StyledTitleRow> */}
        <StockForm symbol={symbol} onOk={() => handlePostSave()} />
      </ContainerStyled>

    </LayoutStyled >
  );
};

StockPage.propTypes = {};

StockPage.defaultProps = {};

export default withRouter(StockPage);
