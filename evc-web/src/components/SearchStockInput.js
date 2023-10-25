
import React from 'react';
import { Select, Button, Typography } from 'antd';
import { listStock, submitStockPlea, incrementStock } from 'services/stockService';
import { SearchOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { StockName } from './StockName';
import { filter } from 'rxjs/operators';
import { GlobalContext } from 'contexts/GlobalContext';
import { notify } from 'util/notify';
import { FormattedMessage } from 'react-intl';
import {from } from 'rxjs';

const { Text } = Typography;

export const SearchStockInput = (props) => {
  const { onChange, excluding, traceSearch, mode, style, size } = props;
  const [loading, setLoading] = React.useState(false);
  const [list, setList] = React.useState([]);
  const [text, setText] = React.useState('');
  const context = React.useContext(GlobalContext);

  const isAdminOrAgent = ['admin', 'agent'].includes(context.role);

  const loadEntities = async () => {
    const stocks = await listStock();
    const sorted = stocks.filter(s => !excluding.includes(s.symbol));
      // .orderBy(['symbol'], ['asc'])
    setList(sorted);
  }

  const subscribeStockListUpdate = () => {
    return context.event$.pipe(
      filter(e => e.type === 'stock.created')
    )
      .subscribe(() => loadEntities());
  }

  React.useEffect(() => {
    const load$ = from(loadEntities()).subscribe();
    const event$ = subscribeStockListUpdate();
    return () => {
      load$.unsubscribe();
      event$.unsubscribe();
    }
  }, []);


  const handleChange = async (symbol) => {
    setText('');
    if (symbol) {
      if (traceSearch) {
        incrementStock(symbol);
      }
      try {
        setLoading(true);
        await onChange(symbol);
      } finally {
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
      size={size}
      mode={mode}
      showSearch
      allowClear={true}
      // autoFocus={true}
      placeholder={<FormattedMessage id="placeholder.searchSymbol" />}
      onChange={handleChange}
      onSearch={handleSearch}
      value={null}
      // open={!!text}
      style={{ textAlign: 'left', width: '100%', minWidth: 100, ...style }}
      loading={loading}
      // showArrow={false}
      suffixIcon={<SearchOutlined size="large" />}
      filterOption={(input, option) => {
        const match = input.toLowerCase();
        const { symbol } = option.data;
        return symbol.toLowerCase() === match;
      }}
      notFoundContent={isAdminOrAgent ? null : <Button type="primary" block onClick={handleStockPlea}>Not Found. Click to request support to stock <strong style={{ marginLeft: 4 }}>{text.toUpperCase()}</strong></Button>}
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

SearchStockInput.propTypes = {
  onChange: PropTypes.func,
  excluding: PropTypes.array.isRequired,
  traceSearch: PropTypes.bool,
  size: PropTypes.string,
  mode: PropTypes.string,
};

SearchStockInput.defaultProps = {
  excluding: [],
  onChange: () => { },
  traceSearch: false,
  mode: '',
  size: 'middle'
};