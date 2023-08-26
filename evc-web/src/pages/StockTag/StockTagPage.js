import React from 'react';
import styled from 'styled-components';
import { Layout } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { withRouter } from 'react-router-dom';
import { deleteStockTag, listStockTags, saveStockTag } from 'services/stockTagService';
import TagManagementPanel from 'components/TagManagementPanel';


const ContainerStyled = styled.div`
  margin: 6rem auto 2rem;
  max-width: 600px;
  width: 100%;

  .ant-btn.ant-btn-link {
    padding-right: 0;
  }
`;


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;



const StockTagPage = () => {

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
          <TagManagementPanel 
            onList={listStockTags}
            onSave={saveStockTag}
            onDelete={deleteStockTag}
          />
      </ContainerStyled>
    </LayoutStyled >

  );
};

StockTagPage.propTypes = {};

StockTagPage.defaultProps = {};

export default withRouter(StockTagPage);
