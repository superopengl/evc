import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Select } from 'antd';
import * as tinycolor from 'tinycolor2';
import { listStockTags } from 'services/stockTagService';
import StockTag from './StockTag';
import styled from 'styled-components';

const { Text } = Typography;

const SelectStyled = styled(Select)`
.ant-select-selector {
  flex-direction: column;
}

.ant-select-selection-item {
  width: 100%;
  justify-content: space-between;
  border: none;
  background: transparent;
}

.ant-select-selection-item-content {
  width: 100%;
}
`;

const StockTagSelect = (props) => {

  const { value, onChange } = props;
  const [tagList, setTagList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedTags, setSelectedTags] = React.useState(value);

  const loadEntity = async () => {
    try {
      setLoading(true);
      const allTags = await listStockTags();
      setTagList(allTags);
      setSelectedTags(value.map(id => allTags.find(t => t.id === id)).filter(x => x))
      debugger;
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadEntity();
  }, []);

  const options = tagList
  // .filter(t => !selectedTags.includes(t.id))
  .filter(t => !selectedTags.some(x => x.key === t.id))
  .map(x => x);

  const handleChange = selected => {
    setSelectedTags(selected);
    onChange(selected.map(s => s.key));
  }

  return (
    <SelectStyled
      mode="multiple"
      allowClear={false}
      style={{ minWidth: 200 }}
      onChange={handleChange}
      disabled={loading}
      value={selectedTags}
      labelInValue
    >
      {options.map((t, i) => <Select.Option key={t.id} value={t.id}>
        <StockTag color={t.color}>{t.name}</StockTag>
      </Select.Option>)}
    </SelectStyled>
  );
};

StockTagSelect.propTypes = {
  // value: PropTypes.string.isRequired,
  value: PropTypes.array.isRequired,
  onChange: PropTypes.func
};

StockTagSelect.defaultProps = {
  value: [],
  onChange: () => { }
};

export default StockTagSelect;
