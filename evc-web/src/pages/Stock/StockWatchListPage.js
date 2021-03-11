import React from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { Typography, Layout, Modal } from 'antd';
import StockList from '../../components/StockList';
import { getWatchList } from 'services/stockService';
import { Link, withRouter } from 'react-router-dom';
import { StarOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

const ContainerStyled = styled.div`
width: 100%;
// max-width: 600px;
`;


const StockWatchListPage = (props) => {

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const loadList = async () => {
    try {
      setLoading(true);
      const resp = await getWatchList();
      if (!resp?.data?.length) {
        // Go to /stock page if nothing gets watched.
        Modal.info({
          title: 'Empty Watchlist',
          content: <>You are not watching any stock. On the Stock Radar page, clicking <StarOutlined style={{ fontSize: 18, color: '#8c8c8c' }} /> icon to add stock to your watchlist.</>,
          onOk: () => props.history.push('/stock'),
          okText: 'Go To Stock Radar Page'
        });
        return;
      }
      ReactDOM.unstable_batchedUpdates(() => {
        const { data } = resp;
        setList(data ?? []);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadList();
  }, []);

  return (
      <ContainerStyled>
        <Paragraph type="secondary">This page lists all the stocks you have chosen to watch. You can always go to <Link to="/stock">Stock Radar</Link> to find all the stocks our platform supports</Paragraph>
        <StockList data={list} loading={loading} onItemClick={stock => props.history.push(`/stock/${stock.symbol}`)} />
      </ContainerStyled>
  );
};

StockWatchListPage.propTypes = {};

StockWatchListPage.defaultProps = {};

export default withRouter(StockWatchListPage);
