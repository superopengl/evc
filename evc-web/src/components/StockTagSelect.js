import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'antd';
import * as tinycolor from 'tinycolor2';
import { listStockTags, saveStockTag } from 'services/stockTagService';
import StockTag from './StockTag';
import styled from 'styled-components';
import CreatableSelect, { makeCreatableSelect } from 'react-select/creatable';
import Select, { components } from 'react-select';
import chroma from 'chroma-js';
import { v4 as uuidv4 } from 'uuid';

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

const MultiValueLabel = props => {
  if (!props.data.color) {
    debugger;
  }
  return (
    <StockTag color={props.data.color}>{props.data.label}</StockTag>
    // <components.MultiValueLabel {...props} />
  );
};

const colourStyles = {
  // control: styles => ({ ...styles, backgroundColor: 'white' }),
  // option: (styles, { data, isDisabled, isFocused, isSelected }) => {
  //   const color = chroma(data.color);
  //   return {
  //     ...styles,
  //     backgroundColor: isDisabled
  //       ? null
  //       : isSelected
  //         ? data.color
  //         : isFocused
  //           ? color.alpha(0.1).css()
  //           : null,
  //     color: isDisabled
  //       ? '#ccc'
  //       : isSelected
  //         ? chroma.contrast(color, 'white') > 2
  //           ? 'white'
  //           : 'black'
  //         : data.color,
  //     cursor: isDisabled ? 'not-allowed' : 'default',

  //     ':active': {
  //       ...styles[':active'],
  //       backgroundColor: !isDisabled && (isSelected ? data.color : color.alpha(0.3).css()),
  //     },
  //   };
  // },
  multiValue: (styles, { data }) => {
    return {
      ...styles,
      width: '100%',
      backgroundColor: 'none',
      // backgroundColor: data.color,
    };
  },
  // multiValueLabel: (styles, { data }) => ({
  //   ...styles,
  //   width: '100%',
  //   color: data.color,
  // }),
  // multiValueRemove: (styles, { data }) => {
  //   const color = chroma(data.color);
  //   return {
  //     ...styles,
  //     color: data.color,
  //     ':hover': {
  //       backgroundColor: color.alpha(0.1).css(),
  //       color: 'white',
  //     },
  //   }
  // },
};

const StockTagSelect = (props) => {

  const { value, onChange } = props;
  const [tagList, setTagList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [defaultValue, setDefaultValue] = React.useState([]);
  const [options, setOptions] = React.useState([]);

  const loadEntity = async () => {
    try {
      setLoading(true);
      const allTags = await listStockTags();
      setTagList(allTags);
      const options = tagList
        // .filter(t => !selectedTags.includes(t.id))
        // .filter(t => !defaultValue.some(x => x.key === t.id))
        .map(x => ({
          value: x.id,
          label: x.name,
          color: x.color
        }));
      setOptions(options);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadEntity();
  }, []);


  const handleChange = selected => {
    setDefaultValue(selected);
    onChange(selected.map(s => s.key));
  }

  const handleChangeNew = async (newValue, actionMeta) => {
    debugger;
    switch (actionMeta.action) {
      case 'create-option':
        break;
      case 'select-option':
        break;
      case 'remove-value':
        break;
      default:
        throw new Error(`Unsupported action ${actionMeta.action}`);
    }
  }

  const handleCreateNew = async (newTagName) => {
    debugger;
    const tagId = uuidv4();
    const newTag = {
      id: tagId,
      name: newTagName,
      color: tinycolor.random().toHexString()
    };
    const newOption = {
      label: newTagName,
      value: tagId,
      color: newTag.color
    };
    try {
      setLoading(true);
      await saveStockTag(newTag);
      setOptions([...options, newOption]);
    } finally {
      setLoading(false);
    }
  }

  return <CreatableSelect
    isMulti
    closeMenuOnSelect={false}
    components={{ MultiValueLabel }}
    isClearable={false}
    isSearchable={true}
    isLoading={loading}
    onChange={handleChangeNew}
    onCreateOption={handleCreateNew}

    defaultValue={defaultValue}
    styles={colourStyles}
    options={options}
  />

  // return (
  //   <SelectStyled
  //     mode="multiple"
  //     allowClear={false}
  //     style={{ minWidth: 200 }}
  //     onChange={handleChange}
  //     disabled={loading}
  //     value={selectedTags}
  //     labelInValue
  //   >
  //     {options.map((t, i) => <Select.Option key={t.id} value={t.id}>
  //       <StockTag color={t.color}>{t.name}</StockTag>
  //     </Select.Option>)}
  //   </SelectStyled>
  // );
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
