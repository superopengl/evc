import React from 'react';
import ReactDOM from "react-dom";
import { Tabs, Card } from 'antd';
import { withRouter } from 'react-router-dom';
import OptionPutCallPanel from './OptionPutCallPanel';
import { getStockLatestOptionPutCall } from 'services/dataService';
import * as _ from 'lodash';
import { Loading } from 'components/Loading';
import PropTypes from "prop-types";

const StockOptionPutCallPanel = (props) => {
  const { symbol, showsLink } = props;

  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const load = async () => {
    const resp = await getStockLatestOptionPutCall(symbol);
    ReactDOM.unstable_batchedUpdates(() => {
      setData([resp]);
      setLoading(false);
    });
  }

  React.useEffect(() => {
    load();
  }, []);

  return (
    <Loading loading={loading}>
      <OptionPutCallPanel data={data} singleMode={true} showsLink={false} />
    </Loading>
  );
};

StockOptionPutCallPanel.propTypes = {
  symbol: PropTypes.string.isRequired,
};

StockOptionPutCallPanel.defaultProps = {
};

export default withRouter(StockOptionPutCallPanel);
