import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Space, Listy } from 'antd';
import { withRouter } from 'util/withRouter';
import { getStockRoster } from 'services/stockService';
import { Loading } from './Loading';
import { from } from 'rxjs';

const { Text } = Typography;

// List -> Listy: the single-column `grid` was only ever a plain vertical stack, and the
// styled(List) wrapper only existed to zero the item's horizontal padding, which Listy
// exposes directly as styles.item.
const ITEM_STYLE = { paddingInline: 0, paddingBlock: 8 };

const StockRosterPanel = (props) => {

  const { symbol } = props;
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getStockRoster(symbol) ?? [];
      setData(data);
      setLoading(false);
      
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const load$ = from(loadData()).subscribe();

    return () => {
      load$.unsubscribe();
    }
  }, []);

  return (
    <Loading loading={loading}>
      <Listy
        items={data}
        rowKey="entityName"
        styles={{ item: ITEM_STYLE }}
        itemRender={item => (
          <Space style={{width: '100%', justifyContent: 'space-between', borderBottom: '1px dotted rgba(0,0,0,0.1)'}}>
            <Text>{item.entityName}</Text>
            <Text>{item.position?.toLocaleString()}</Text>
          </Space>
        )}
      />
    </Loading>
  );
};

StockRosterPanel.propTypes = {
  symbol: PropTypes.string.isRequired
};

export default withRouter(StockRosterPanel);
