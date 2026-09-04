import React from 'react';
import { withRouter } from 'util/withRouter';
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

export default withRouter(HeaderStockSearch);
