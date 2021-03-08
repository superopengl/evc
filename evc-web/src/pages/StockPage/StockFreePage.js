import { Space, PageHeader, Tag } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { Loading } from 'components/Loading';
import { GlobalContext } from 'contexts/GlobalContext';
import { getStock, unwatchStock, watchStock } from 'services/stockService';
import { StockName } from 'components/StockName';
import { StockWatchButton } from 'components/StockWatchButton';
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { listStockTags } from 'services/stockTagService';
import StockDisplayPanel from 'components/StockDisplayPanel';
import { notify } from 'util/notify';


const StockFreePage = (props) => {
  const { symbol } = props;

  const context = React.useContext(GlobalContext);
  const { role } = context;
  const [, setHasPaid] = React.useState(false);
  const [stock, setStock] = React.useState();
  const [watched, setWatched] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const [, setStockTags] = React.useState([]);

  const loadEntity = async () => {
    if (!symbol) {
      return;
    }
    try {
      setLoading(true);
      // const { data: toSignTaskList } = await searchTask({ status: ['to_sign'] });
      const stock = await getStock(symbol);
      const tags = await listStockTags();
      ReactDOM.unstable_batchedUpdates(() => {
        setStock(stock);
        setStockTags(tags);
        setWatched(stock.watched);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadEntity();
  }, [symbol]);

  React.useEffect(() => {
    setHasPaid(['admin', 'agent', 'member'].includes(role));
  }, [role]);

  const handleToggleWatch = async watching => {
    stock.watched = watching;
    if (watching) {
      await watchStock(stock.symbol);
      notify.success('Stock watchlist', <>Added <strong>{stock.symbol}</strong> to your watchlist.</>, 3);
    } else {
      await unwatchStock(stock.symbol);
      notify.info('Stock watchlist', <>Removed <strong>{stock.symbol}</strong> to your watchlist.</>, 3);
    }
    setWatched(watching);
  }

  return (
    <>
      {(loading || !stock) ? <Loading /> : <>
        <PageHeader
          style={{ paddingTop: 0 }}
          ghost={false}
          onBack={() => props.history.goBack()}
          title={<Space size="middle">
            <StockName value={stock} />
            {stock?.isOver ? <Tag color="yellow">over valued</Tag> : stock?.isUnder ? <Tag color="cyan">under valued</Tag> : null}
            <StockWatchButton size={20} value={watched} onChange={handleToggleWatch} />
          </Space>}
        />

        {stock && <StockDisplayPanel stock={stock}/>}
      </>}
    </>
  );
};

StockFreePage.propTypes = {
  symbol: PropTypes.string.isRequired,
};

StockFreePage.defaultProps = {};

export default withRouter(StockFreePage);
