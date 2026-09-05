import React from 'react';
import styled from 'styled-components';
import { Typography, Divider } from 'antd';
import StockList from '../../components/StockList';
import { getWatchList, listCustomTags } from 'services/watchListService';
import { Link } from 'react-router-dom';
import { withRouter } from 'util/withRouter';
import { StarOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { from } from 'rxjs';
import { GlobalContext } from 'contexts/GlobalContext';
import { StockCustomTagFilterPanel } from 'components/StockCustomTagFilterPanel';
import { reactLocalStorage } from 'util/reactLocalStorage';
import { modal } from 'util/antdStatic';

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
        modal.info({
          title: 'Empty Watchlist',
          content: <>You are not watching any stock. On the Stock Radar page, clicking <StarOutlined style={{ fontSize: 18, color: '#8c8c8c' }} /> icon to add stock to your watchlist.</>,
          onOk: () => props.history.push('/stock'),
          okText: 'Go To Stock Radar Page'
        });
        return;
      }

      const { data } = resp;
      setList(data ?? []);
      setLoading(false);
      
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
      <Paragraph type="secondary">
        <FormattedMessage id="text.watchListMessage" values={{link: <Link to="/stock"><FormattedMessage id="menu.stockRadar" /></Link>}} />
      </Paragraph>
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

export default withRouter(StockWatchListPage);
