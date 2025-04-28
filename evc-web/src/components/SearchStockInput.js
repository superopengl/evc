
import React from 'react';
import { Select, Button, Typography, Space } from 'antd';
import { listStock, submitStockPlea, incrementStock } from 'services/stockService';
import { SearchOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { StockName } from './StockName';
import { filter } from 'rxjs/operators';
import { GlobalContext } from 'contexts/GlobalContext';
import { notify } from 'util/notify';
import { FormattedMessage } from 'react-intl';
import { from } from 'rxjs';
import orderBy from 'lodash/orderBy';
import { MdOpenInNew } from 'react-icons/md';
import Icon from '@ant-design/icons';
const { Text, Link: TextLink } = Typography;

export const SearchStockInput = (props) => {
  const { onChange, traceSearch, mode, style, size, showsLink } = props;
  const [loading, setLoading] = React.useState(false);
  const [list, setList] = React.useState([]);
  const [text, setText] = React.useState('');
  const context = React.useContext(GlobalContext);

  const isAdminOrAgent = ['admin', 'agent'].includes(context.role);

  const loadEntities = async () => {
    const stocks = await listStock();
    setList(stocks);
  }

  const subscribeStockListUpdate = () => {
    return context.event$
      .pipe(
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
    const text = value?.trim().toUpperCase();
    setText(text);
  }

  const handleStockPlea = async () => {
    const symbol = text;
    setText('');
    await submitStockPlea(symbol);
    notify.success(<>Successfully submitted the request to support stock <Text strong>{symbol}</Text></>)
  }


  const getOptions = () => {
    let options = [...list];
    if (text) {
      options = options.map(item => {
        const symbol = item.symbol.toUpperCase();
        const company = item.company?.toUpperCase();

        let ordinal = -1;
        if (symbol === text || company === text) {
          ordinal = Number.MIN_SAFE_INTEGER;
        } else {
          const symbolLeftMatchIndex = symbol.indexOf(text);
          const compnayLeftMatchIndex = company?.indexOf(text) ?? -1;

          const adjLeftIndex = symbolLeftMatchIndex * compnayLeftMatchIndex;
          if (adjLeftIndex <= 0) {
            ordinal = Math.abs(adjLeftIndex);
          } else {
            ordinal = Math.min(symbolLeftMatchIndex, compnayLeftMatchIndex)
          }
        }

        item.ordinal = ordinal;
        return item;
      }).filter(x => x.ordinal !== -1)
      options = orderBy(options, ['ordinal']);
    }

    return options
      .map((item, i) => <Select.Option key={i} value={item.symbol} data={item}>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <StockName value={item} highlightenText={text} />
          {showsLink && <TextLink href={`/stock/${item.symbol}`} target='_blank' strong onClick={e => e.stopPropagation()}>
            <Icon component={() => <MdOpenInNew />} />
          </TextLink>}
        </Space>
      </Select.Option>)
  }

  return (
    <>
      <Select
        size={size}
        listHeight={400}
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
          return true;
          // const match = input.toLowerCase();
          // const { symbol } = option.data;
          // return symbol.toLowerCase() === match;
        }}
        notFoundContent={isAdminOrAgent ?
          null :
          <Button type="primary" block onClick={handleStockPlea} style={{ height: 'auto', maxWidth: '100%' }}>
            <Text style={{ whiteSpace: 'pre-wrap', color: 'white' }}>
              Not Found. Click to request support for stock
              <strong style={{ marginLeft: 4 }}>{text.toUpperCase()}</strong>
            </Text>
          </Button>}
      >
        {getOptions()}
      </Select>
    </>
  );
}

SearchStockInput.propTypes = {
  onChange: PropTypes.func,
  traceSearch: PropTypes.bool,
  size: PropTypes.string,
  mode: PropTypes.string,
  showsLink: PropTypes.bool,
};

SearchStockInput.defaultProps = {
  onChange: () => { },
  traceSearch: false,
  mode: '',
  size: 'middle',
  showsLink: false,
};