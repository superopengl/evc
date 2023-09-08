import React from 'react';
import { Drawer, Button, Typography, Alert, Space } from 'antd';
import { getStock } from 'services/stockService';
import { StockName } from 'components/StockName';
import ReactDOM from "react-dom";
import { Link, withRouter } from 'react-router-dom';
import PropTypes from "prop-types";
import StockDisplayPanel from './StockDisplayPanel';
import { Loading } from 'components/Loading';

const { Text } = Typography;

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
      bodyStyle={{
        backgroundColor: 'rgb(240, 242, 245)'
      }}
      placement="bottom"
      closable={true}
      maskClosable={true}
      destroyOnClose={true}
      onClose={onClose}
      footer={null}
      title={<Space direction="vertical" size="large" style={{width: '100%'}}>
        <Text>{stock ? <StockName value={stock} /> : symbol} - Preview</Text>
        <Alert
          message={<><big>😉 </big><Text style={{fontStyle: 'italic'}} type="success">More information is available to signed up users</Text></>}
          action={
            <Button type="primary" size="large" style={{width: 140}}>Sign Up Now</Button>
          }
          type="success" />
      </Space>}
      height="85vh"
    >

      {stock ? <StockDisplayPanel stock={stock} /> : <Loading loading={true} />}
    </Drawer>
  );
};

StockGuestPreviewDrawer.propTypes = {
  symbol: PropTypes.string,
};

StockGuestPreviewDrawer.defaultProps = {};

