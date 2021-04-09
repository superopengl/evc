import React from 'react';
import { Drawer, Button, Typography, Alert, Space } from 'antd';
import StockRadarPage from 'pages/Stock/StockRadarPage';
import PropTypes from "prop-types";

const { Text } = Typography;

export const StockGuestStockRadarDrawer = (props) => {
  const { visible: propVisible, onClose, onSymbolClick } = props;

  const [visible, setVisible] = React.useState(propVisible);

  React.useEffect(() => {
    setVisible(propVisible)
  }, [propVisible]);

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
      title={<Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Text>Stock Radar - Preview</Text>
        <Alert
          message={<><big>😉</big>
          <Text style={{ fontStyle: 'italic', marginLeft: 12 }} type="success">More information is available to signed up users</Text></>}
          action={
            <Button type="primary" style={{ width: 140 }}>Sign Up Now</Button>
          }
          type="success" />
      </Space>}
      height="85vh"
    >

      <StockRadarPage onItemClick={onSymbolClick}/>
    </Drawer>
  );
};

StockGuestStockRadarDrawer.propTypes = {
  onSymbolClick: PropTypes.func,
};

StockGuestStockRadarDrawer.defaultProps = {
  onSymbolClick: () => { },
};

