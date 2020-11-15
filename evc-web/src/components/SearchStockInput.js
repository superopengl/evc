
import React from 'react';
import { Link } from 'react-router-dom';
import { Select } from 'antd';
import { searchStock, listStock, getStock, incrementStock } from 'services/stockService';
import Highlighter from "react-highlight-words";
import * as _ from 'lodash';
import { SearchOutlined } from '@ant-design/icons';

export const SearchStockInput = (props) => {
  const {onChange, onFetchData} = props;
  const [loading, setLoading] = React.useState(false);
  const [list, setList] = React.useState([]);
  const [text, setText] = React.useState('');

  const loadEntities = async () => {
    const stocks = await listStock();
    const sorted = _.orderBy(stocks, ['company'], ['asc']);
    setList(sorted);
  }

  React.useEffect(() => {
    loadEntities();
  }, []);


  const handleChange = async (symbol) => {
    setText('');
    incrementStock(symbol);
    setLoading(true);
    let data = null;
    try{
      data = await onFetchData(symbol);
    }finally{
      setLoading(false);
    }
    onChange(data);
  }

  const handleSearch = async (value) => {
    const text = value.trim();
    setText(text);
  }

  const handleFocus = () => { }
  const handleBlur = () => { }

  return (
    <Select
      size="large"
      style={{...props.style}}
      showSearch
      autoFocus={true}
      placeholder="Search for symbols or companies"
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onSearch={handleSearch}
      style={{textAlign: 'left', width: '100%'}}
      loading={loading}
      // showArrow={false}
      suffixIcon={<SearchOutlined/>}
      filterOption={(input, option) => {
        const match = input.toLowerCase();
        const {symbol, company} = option.data;
        return symbol.toLowerCase().includes(match) || company.toLowerCase().includes(match);
      }}
    >
      {list.map((item, i) => <Select.Option key={i} value={item.symbol} data={item}>
        <Highlighter highlightClassName="search-highlighting"
          searchWords={[text]}
          autoEscape={true}
          textToHighlight={item.company} /> (<Highlighter highlightClassName="search-highlighting"
          searchWords={[text]}
          autoEscape={true}
          textToHighlight={item.symbol} />)
    </Select.Option>)}
    </Select>
  );
}
