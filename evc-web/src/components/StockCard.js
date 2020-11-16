import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Space, Button, Tooltip, Modal } from 'antd';
import { withRouter } from 'react-router-dom';
import { DeleteOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;


const StockList = (props) => {

  const { value } = props;

  const [stock] = React.useState(value);

  return (
    <Card
      title={<>{stock.symbol} <Text type="secondary"><small>({stock.company})</small></Text></>}
      hoverable={true}
      actions={[
        props.showRemove && <Tooltip title="Remove from search result list">
          < Button type="link" danger icon={< DeleteOutlined />} onClick={props.onRemove} />
        </Tooltip>,
        props.showWatch && <Tooltip title="Add to watchlist">
          <Button type="link" icon={<EyeOutlined />} onClick={props.onWatch} />
        </Tooltip>,
        props.showUnwatch && <Tooltip title="Remove from watchlist">
          <Button type="link" icon={<EyeInvisibleOutlined />} onClick={props.onUnwatch} />
        </Tooltip>,
      ].filter(x => x)}
    >
      <Paragraph>PR {stock.peLo} - {stock.peHi}</Paragraph>
      <Paragraph>Value {stock.value} </Paragraph>
      <Paragraph>Support {stock.supportPriceLo} - {stock.supportPriceHi}</Paragraph>
      <Paragraph>Pressure {stock.pressurePriceLo} - {stock.pressurePriceLo}</Paragraph>
    </Card >
  );
};

StockList.propTypes = {
  value: PropTypes.object.isRequired,
  showRemove: PropTypes.bool.isRequired,
  showWatch: PropTypes.bool.isRequired,
  showUnwatch: PropTypes.bool.isRequired,
  onRemove: PropTypes.func,
  onWatch: PropTypes.func,
  onUnwatch: PropTypes.func,
};

StockList.defaultProps = {
  showRemove: false,
  showWatch: false,
  showUnwatch: false,
};

export default withRouter(StockList);
