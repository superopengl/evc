import React from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { Typography, Modal, Divider } from 'antd';
import StockList from '../../components/StockList';
import { getWatchList, listCustomTags } from 'services/watchListService';
import { Link, withRouter } from 'react-router-dom';
import { StarOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { from } from 'rxjs';
import { GlobalContext } from 'contexts/GlobalContext';
import { StockCustomTagFilterPanel } from 'components/StockCustomTagFilterPanel';
import { reactLocalStorage } from 'reactjs-localstorage';

const { Paragraph } = Typography;

const ContainerStyled = styled.div`
width: 100%;
// max-width: 600px;
`;

const LOCAL_STORAGE_QUERY_KEY = 'watchlist_tags'

const StockWatchListPage = (props) => {

  const [list, setList] = React.useState([]);
  const [selectedTagIds, setSelectedTagIds] = React.useState(reactLocalStorage.getObject(LOCAL_STORAGE_QUERY_KEY, []));
  const [loading, setLoading] = React.useState(false);
  const context = React.useContext(GlobalContext);

  const loadList = async () => {
    try {
      setLoading(true);
      const resp = await getWatchList(selectedTagIds);
      reactLocalStorage.setObject(LOCAL_STORAGE_QUERY_KEY, selectedTagIds);

      await context.reloadCustomTags();
      if (!selectedTagIds.length && !resp?.data?.length) {
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
    } catch (e) {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadList();
  }, [selectedTagIds]);

  const handleDeleteTag = (id) => {
    setSelectedTagIds(selectedTagIds.filter(x => x !== id));
  }

  const handleAddTag = async () => {
    await context.reloadCustomTags();
  }

  return (
    <ContainerStyled>
      <Paragraph type="secondary">This page lists all the stocks you have chosen to watch. You can always go to <Link to="/stock"><FormattedMessage id="menu.stockRadar" /></Link> to find all the stocks our platform supports.</Paragraph>
      <StockCustomTagFilterPanel
        onChange={setSelectedTagIds}
        onDeleteTag={handleDeleteTag}
        onAddTag={handleAddTag}
        value={selectedTagIds}
      />
      <Divider />
      <StockList
        data={list}
        loading={loading}
        onItemClick={stock => props.history.push(`/stock/${stock.symbol}`)}
        showBell={true}
        showTags={true}
      />
    </ContainerStyled>
  );
};

StockWatchListPage.propTypes = {};

StockWatchListPage.defaultProps = {};

export default withRouter(StockWatchListPage);
