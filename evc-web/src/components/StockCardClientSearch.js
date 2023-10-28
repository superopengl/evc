import React from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip } from 'antd';
import { withRouter } from 'react-router-dom';
import { DeleteOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import StockInfoCard from './StockInfoCard';

const StockCardClientSearch = (props) => {

  const { value } = props;

  const [stock] = React.useState(value);

  return (
    <>
    <StockInfoCard
      value={stock}
      hoverable={false}
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
    />
  </>
  );
};

StockCardClientSearch.propTypes = {
  value: PropTypes.object,
  showRemove: PropTypes.bool.isRequired,
  showWatch: PropTypes.bool.isRequired,
  showUnwatch: PropTypes.bool.isRequired,
  onRemove: PropTypes.func,
  onWatch: PropTypes.func,
  onUnwatch: PropTypes.func,
  onClick: PropTypes.func
};

StockCardClientSearch.defaultProps = {
  showRemove: false,
  showWatch: false,
  showUnwatch: false,
};

export default withRouter(StockCardClientSearch);
