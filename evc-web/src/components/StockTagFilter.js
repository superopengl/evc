import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Space } from 'antd';
import * as tinycolor from 'tinycolor2';
import chroma from 'chroma-js';
import { listStockTags } from 'services/stockTagService';
import StockTag from './StockTag';
import { Loading } from './Loading';

const { Text } = Typography;


const StockTagFilter = (props) => {

  const { onChange, value, loading: propLoading } = props;
  const [loading, setLoading] = React.useState(propLoading);
  const [selected, setSelected] = React.useState(value);
  const [allTags, setAllTags] = React.useState([]);

  const loadList = async () => {
    try {
      setLoading(true);
      const list = await listStockTags();
      setAllTags(list);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadList();
  }, []);

  const isSelected = (tag) => {
    return selected.includes(tag.id);
  }

  const toggleSelected = (tag) => {
    let newSelected;
    if (isSelected(tag)) {
      newSelected = [...selected.filter(x => x !== tag.id)];
    } else {
      newSelected = [...selected, tag.id];
    }
    setSelected(newSelected);
    onChange(newSelected);
  }

  return (
    <Loading loading={loading}>
      <Space size="small" style={{padding: '1rem 0'}}>
        {allTags.map((t, i) => <StockTag
          key={i}
          color={t.color}
          clickable={true}
          checked={isSelected(t)}
          onClick={() => toggleSelected(t)}
        >
          {t.name}
        </StockTag>)}
      </Space>
    </Loading>
  );
};

StockTagFilter.propTypes = {
  // value: PropTypes.string.isRequired,
  value: PropTypes.array,
  loading: PropTypes.bool,
  onChange: PropTypes.func,
};

StockTagFilter.defaultProps = {
  value: [],
  loading: true,
  onChange: () => { }
};

export default StockTagFilter;
