
import React from 'react';
import { Link } from 'react-router-dom';
import { Select } from 'antd';
import { searchStock, listStock, getStock, incrementStock } from 'services/stockService';
import Highlighter from "react-highlight-words";
import * as _ from 'lodash';
import { SearchOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { StockName } from './StockName';

export const StockSearchInput = (props) => {
  const { onChange, excluding, traceSearch, mode, style, value } = props;
  const [loading, setLoading] = React.useState(false);
  const [list, setList] = React.useState([]);
  const [text, setText] = React.useState('');

  const loadEntities = async () => {
    const stocks = await listStock();
    const sorted = _.chain(stocks)
      .filter(s => !excluding.includes(s.symbol))
      // .orderBy(['symbol'], ['asc'])
      .value();
    setList(sorted);
  }

  React.useEffect(() => {
    loadEntities();
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
      style={{ textAlign: 'left', width: '100%', ...style }}
      loading={loading}
      // showArrow={false}
      suffixIcon={<SearchOutlined size="large" />}
      filterOption={(input, option) => {
        const match = input.toLowerCase();
        const { symbol, company } = option.data;
        return symbol.toLowerCase().includes(match) || company.toLowerCase().includes(match);
      }}
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