import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Space, Image } from 'antd';
import { getStockLogoUrl } from 'util/getStockLogoUrl';
import HighlightingText from 'components/HighlightingText';

const { Text } = Typography;


export const StockName = (props) => {

  const { value, size, style, direction, showsLogo, logoSize, highlightenText, ...other } = props;

  const { symbol, company } = value;

  return (
    <Space direction={direction} {...other} size="small" style={{ fontSize: size }}>
      <Text strong><HighlightingText search={highlightenText} value={symbol} /></Text>
      {!!company && <Text type="secondary" style={{ fontSize: size, fontWeight: 300 }}>
        (<HighlightingText search={highlightenText} value={company} />)
      </Text>}
      {showsLogo && <Image src={getStockLogoUrl(symbol)}
        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAAtJREFUGFdjYAACAAAFAAGq1chRAAAAAElFTkSuQmCC"
        width={'auto'}
        height={logoSize}
        preview={false}
        style={{ marginLeft: 4 }} />}
    </Space>
  );
};

StockName.propTypes = {
  value: PropTypes.object.isRequired,
  size: PropTypes.number,
  direction: PropTypes.oneOf(['vertical', 'horizontal']),
  showsLogo: PropTypes.bool,
  logoSize: PropTypes.number,
  highlightenText: PropTypes.string,
};

StockName.defaultProps = {
  // size: 14,
  direction: 'horizontal',
  showsLogo: false,
  logoSize: 18
}