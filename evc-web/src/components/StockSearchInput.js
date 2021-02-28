
import React from 'react';
import { Select, Button, Typography } from 'antd';
import { listStock, submitStockPlea, incrementStock } from 'services/stockService';
import * as _ from 'lodash';
import { SearchOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { StockName } from './StockName';
import { filter } from 'rxjs/operators';
import { GlobalContext } from 'contexts/GlobalContext';
import { notify } from 'util/notify';

const {Text} = Typography;

export const StockSearchInput = (props) => {
  const { onChange, excluding, traceSearch, mode, style } = props;
  const [loading, setLoading] = React.useState(false);
  const [list, setList] = React.useState([]);
  const [text, setText] = React.useState('');
  const context = React.useContext(GlobalContext);

  const loadEntities = async () => {
    const stocks = await listStock();
    const sorted = _.chain(stocks)
      .filter(s => !excluding.includes(s.symbol))
      // .orderBy(['symbol'], ['asc'])
      .value();
    setList(sorted);
  }
  
  const subscribeStockListUpdate = () => {
    return context.event$.pipe(
      filter(e => e.type === 'stock.created')
    )
    .subscribe(() => loadEntities());
  }

  React.useEffect(() => {
    loadEntities();
    const subscription = subscribeStockListUpdate();
    return () => {
      subscription.unsubscribe();
    }
  }, []);


  const handleChange = async (symbol) => {
    setText('');
    if (symbol) {
      if (traceSearch) {
        incrementStock(symbol);
      }
      try{ 
        setLoading(true);
        await onChange(symbol);
      }finally{
        setLoading(false);
      }
    }
  }

  const handleSearch = async (value) => {
    const text = value.trim();
    setText(text);
  }

  const handleStockPlea = async () => {
    const symbol = text?.trim().toUpperCase();
    setText('');
    await submitStockPlea(symbol);
    notify.success(<>Successfully submitted the request to support stock <Text strong>{symbol}</Text></>)
  }

  return (
    <Select
      size="large"
      mode={mode}
      showSearch
      allowClear={true}
      // autoFocus={true}
      placeholder="Search for symbols or companies"
      onChange={handleChange}
      onSearch={handleSearch}
      // open={!!text}
      style={{ textAlign: 'left', width: '100%', ...style }}
      loading={loading}
      // showArrow={false}
      suffixIcon={<SearchOutlined size="large" />}
      filterOption={(input, option) => {
        const match = input.toLowerCase();
        const { symbol, company } = option.data;
        return symbol.toLowerCase().includes(match) || company.toLowerCase().includes(match);
      }}
      notFoundContent={<Button type="primary" block onClick={handleStockPlea}>Request to support stock <strong style={{marginLeft: 4}}>{text.toUpperCase()}</strong></Button>}
    >
      {list.map((item, i) => <Select.Option key={i} value={item.symbol} data={item}>
        {/* <Highlighter highlightClassName="search-highlighting"
          searchWords={[text]}
          autoEscape={true}
          textToHighlight={item.symbol} /> (<Highlighter highlightClassName="search-highlighting"
            searchWords={[text]}
            autoEscape={true}
            textToHighlight={item.company} />) */}
        <StockName value={item} />
      </Select.Option>)}
    </Select>
  );
}

StockSearchInput.propTypes = {
  onChange: PropTypes.func,
  excluding: PropTypes.array.isRequired,
  traceSearch: PropTypes.bool,
  mode: PropTypes.string,
};

StockSearchInput.defaultProps = {
  excluding: [],
  onChange: () => { },
  traceSearch: false,
  mode: ''
};