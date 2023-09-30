import { Space, PageHeader, Tag, Button, Modal, Typography } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { Loading } from 'components/Loading';
import { GlobalContext } from 'contexts/GlobalContext';
import { deleteStock, getStock, unwatchStock, watchStock, bellStock, unbellStock, getStockNextReportDate } from 'services/stockService';
import { StockName } from 'components/StockName';
import { StockWatchButton } from 'components/StockWatchButton';
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { listStockTags } from 'services/stockTagService';
import StockDisplayPanel from 'components/StockDisplayPanel';
import { notify } from 'util/notify';
import StockAdminPanel from 'components/StockAdminPanel';
import TagSelect from 'components/TagSelect';
import { DeleteOutlined, TagsOutlined } from '@ant-design/icons';
import StockEditTagModal from 'components/StockEditTagModal';
import { updateStock } from 'services/stockService';
import { StockNoticeButton } from 'components/StockNoticeButton';
import moment from 'moment';

const { Text, Paragraph } = Typography;

const StockDetailPage = (props) => {
  const { symbol } = props;

  const context = React.useContext(GlobalContext);
  const { role } = context;
  const [stock, setStock] = React.useState();
  const [watched, setWatched] = React.useState();
  const [belled, setBelled] = React.useState(stock?.belled);
  const [loading, setLoading] = React.useState(true);
  const [stockTags, setStockTags] = React.useState([]);
  const [editTagVisible, setEditTagVisible] = React.useState(false);
  const [reportDate, setReportDate] = React.useState();

  const loadEntity = async () => {
    if (!symbol) {
      return;
    }
    try {
      setLoading(true);
      // const { data: toSignTaskList } = await searchTask({ status: ['to_sign'] });
      const [stock, reportDate, tags] = await Promise.all([
        getStock(symbol),
        getStockNextReportDate(symbol),
        listStockTags()
      ]);

      ReactDOM.unstable_batchedUpdates(() => {
        setStock(stock);
        setReportDate(reportDate);
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

  const isMemberOrFree = ['member', 'free'].includes(role);
  const isMember = 'member' === role;
  const isAdminOrAgent = ['admin', 'agent'].includes(role);
  const isGuest = role === 'guest';

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

  const handleDeleteStock = () => {
    Modal.confirm({
      title: `Permanately delete ${symbol} from EVC`,
      closable: true,
      maskClosable: true,
      content: <>
        <Paragraph>
          This operation is not revertable. All the associabled data (supports, resistances, fair values) with this stock will be deleted. System may take several minutes to update all views.
          </Paragraph>
        <Paragraph>
          If you want to add this stock back, you can choose add new stock and manually fetch EPS, close data again.
        </Paragraph>
      </>,
      okButtonProps: {
        type: 'primary',
        danger: true
      },
      okText: `Yes, delete!`,
      onOk: async () => {
        try {
          setLoading(true);
          await deleteStock(symbol);
          props.history.push('/stock');
        } catch {
          setLoading(false);
        }
      },
      cancelText: `No, keep it`
    });
  }

  const handleTagChange = async (value) => {
    stock.tags = value;
    await updateStock(stock);
    setEditTagVisible(false)
  }

  const handleToggleBell = async belling => {
    if (belling) {
      await bellStock(stock.symbol);
    } else {
      await unbellStock(stock.symbol);
    }
    setBelled(belling);
  }

  return (
    <>
      {(loading || !stock) ? <Loading /> : <>
        <PageHeader
          style={{
            backgroundColor: 'white',
            margin: -30,
            marginBottom: 0,
            padding: 30,
          }}
          ghost={false}
          onBack={() => props.history.goBack()}
          title={<Space size="middle">
            <StockName value={stock} />
            {stock?.isOver ? <Tag color="yellow">over valued</Tag> : stock?.isUnder ? <Tag color="cyan">under valued</Tag> : null}

          </Space>}
          extra={[
            isMember ? <StockNoticeButton key="bell" size={20} value={belled} onChange={handleToggleBell} /> : null,
            isMemberOrFree ? <StockWatchButton key="watch" size={20} value={watched} onChange={handleToggleWatch} /> : null,
            isAdminOrAgent ? <Button key="tag" type="primary" ghost icon={<TagsOutlined />} onClick={() => setEditTagVisible(true)}>Edit Tag</Button> : null,
            isAdminOrAgent ? <Button key="delete" type="primary" danger icon={<DeleteOutlined />} onClick={handleDeleteStock}>Delete Stock</Button> : null
          ].filter(x => !!x)}
        >
          {reportDate && <Paragraph>Next report date is {moment(reportDate).format('D MMM YYYY')}</Paragraph>}
          {!isGuest && <TagSelect value={stock.tags} tags={stockTags} readonly={true} />}

          {isAdminOrAgent && <StockAdminPanel stock={stock} onDataChange={loadEntity}/>}

        </PageHeader>
        <StockEditTagModal
          visible={editTagVisible}
          value={stock.tags}
          tags={stockTags}
          onOk={handleTagChange}
          onCancel={() => setEditTagVisible(false)}
        />

        {stock && <StockDisplayPanel stock={stock} />}
      </>}
    </>
  );
};

StockDetailPage.propTypes = {
  symbol: PropTypes.string.isRequired,
};

StockDetailPage.defaultProps = {};

export default withRouter(StockDetailPage);
