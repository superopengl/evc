import React from 'react';
import { Drawer, Skeleton, Typography } from 'antd';
import { getStock } from 'services/stockService';
import { StockName } from 'components/StockName';
import ReactDOM from "react-dom";
import { Link, withRouter } from 'react-router-dom';
import PropTypes from "prop-types";
import StockDisplayPanel from './StockDisplayPanel';
import { Loading } from 'components/Loading';

const {Text} = Typography;

export const StockGuestPreviewDrawer = (props) => {
  const { symbol, visible: propVisible, onClose } = props;

  const [stock, setStock] = React.useState();
  const [visible, setVisible] = React.useState(propVisible);

  React.useEffect(() => {
    setVisible(propVisible)
  }, [propVisible]);

  const loadEntity = async () => {
    if (!symbol) {
      return;
    }
    // const { data: toSignTaskList } = await searchTask({ status: ['to_sign'] });
    const stock = await getStock(symbol);
    ReactDOM.unstable_batchedUpdates(() => {
      setStock(stock);
    });
  }

  React.useEffect(() => {
    loadEntity();
  }, [symbol]);

  return (
    <Drawer
      visible={visible}
      placement="bottom"
      closable={true}
      maskClosable={true}
      destroyOnClose={true}
      onClose={onClose}
      footer={null}
      title={stock ? <>Preview <StockName value={stock} /> - <Text type="warning"><Link to="/signup">Sign Up</Link> today to see more information!</Text></> : <Skeleton.Input active />}
      height="95vh"
    >
      {stock ? <StockDisplayPanel stock={stock} /> : <Loading loading={true} />}
    </Drawer>
  );
};

StockGuestPreviewDrawer.propTypes = {
  symbol: PropTypes.string,
};

StockGuestPreviewDrawer.defaultProps = {};

