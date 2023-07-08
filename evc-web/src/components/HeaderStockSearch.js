import React from 'react';
import { withRouter } from 'react-router-dom';
import { StockSearchInput } from 'components/StockSearchInput';

const HeaderStockSearch = (props) => {

  const handleSelectedStock = (symbol) => {
    props.history.push(`/stock/${symbol}`);
  }

  return (
        <StockSearchInput
          onChange={handleSelectedStock}
          style={{ width: '100%', maxWidth: 400 }} />
  );
};

HeaderStockSearch.propTypes = {};

HeaderStockSearch.defaultProps = {};

export default withRouter(HeaderStockSearch);
