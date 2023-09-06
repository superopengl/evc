import React from 'react';
import { withRouter } from 'react-router-dom';
import { StockSearchInput } from 'components/StockSearchInput';
import { Space } from 'antd';

const HeaderStockSearch = (props) => {

  const handleSelectedStock = (symbol) => {
    props.history.push(`/stock/${symbol}`);
  }

  return (
      <StockSearchInput
        style={{width: '100%', maxWidth: 400}}
        onChange={handleSelectedStock} />
  );
};

HeaderStockSearch.propTypes = {};

HeaderStockSearch.defaultProps = {};

export default withRouter(HeaderStockSearch);
