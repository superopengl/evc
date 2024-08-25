import React from 'react';
import { withRouter } from 'react-router-dom';
import { SearchStockInput } from 'components/SearchStockInput';

const HeaderStockSearch = (props) => {

  const handleSelectedStock = (symbol) => {
    props.history.push(`/stock/${symbol}`);
  }

  return (
    <SearchStockInput
      style={{ width: '100%', minWidth: 200, maxWidth: 400 }}
      onChange={handleSelectedStock}
      showsLink={true}
    />
  );
};

HeaderStockSearch.propTypes = {};

HeaderStockSearch.defaultProps = {};

export default withRouter(HeaderStockSearch);
