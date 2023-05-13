import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Space, Button } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { listMessages } from 'services/messageService';
import { GlobalContext } from 'contexts/GlobalContext';
import StockList from '../../components/StockList';
import { searchStock } from 'services/stockService';
import { PlusOutlined } from '@ant-design/icons';
import { withRouter } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const ContainerStyled = styled.div`
margin: 6rem auto 2rem auto;
padding: 0 1rem;
width: 100%;
max-width: 600px;
`;

const StyledTitleRow = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 width: 100%;
`

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;

  .ant-list-item {
    padding-left: 0;
    padding-right: 0;
  }
`;


const StockListPage = (props) => {

  const context = React.useContext(GlobalContext);

  const { role } = context;
  const isClient = role === 'client';


  const handleFetchNextPage = async (page, size) => {
    return await searchStock({page, size});
  }

  const addNewStock = () => {
    props.history.push(`/stock/new`);
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space size="small" direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Stock List</Title>
          </StyledTitleRow>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }} >
            {/* <Button type="link" onClick={() => loadList()} icon={<SyncOutlined />}></Button> */}
            <Button type="primary" icon={<PlusOutlined />} onClick={() => addNewStock()}>Add Stock</Button>
          </Space>
          <StockList
            onFetchNextPage={handleFetchNextPage}
          />
        </Space>
      </ContainerStyled>
    </LayoutStyled>
  );
};

StockListPage.propTypes = {};

StockListPage.defaultProps = {};

export default withRouter(StockListPage);
