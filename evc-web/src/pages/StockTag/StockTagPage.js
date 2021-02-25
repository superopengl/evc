import React from 'react';
import { withRouter } from 'react-router-dom';
import { deleteStockTag, listStockTags, saveStockTag } from 'services/stockTagService';
import TagManagementPanel from 'components/TagManagementPanel';

const StockTagPage = () => {

  return (
    <TagManagementPanel
      onList={listStockTags}
      onSave={saveStockTag}
      onDelete={deleteStockTag}
    />

  );
};

StockTagPage.propTypes = {};

StockTagPage.defaultProps = {};

export default withRouter(StockTagPage);
