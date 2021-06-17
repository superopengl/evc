import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import Tag from './Tag';
import { GlobalContext } from 'contexts/GlobalContext';
import { createCustomTag } from 'services/watchListService';
import styled from 'styled-components';

const Container = styled.div`
width: 100%;

.ant-select-selection-item-content {
  font-size: 12px;
}
`;

const StockCustomTagSelect = (props) => {

  const { value, readonly, onChange, onBlur } = props;
  const context = React.useContext(GlobalContext);
  const [selected, setSelected] = React.useState(value);

  // const initSelectedOptions = allOptions.filter(x => selectedTagIds?.some(tagId => tagId === x.value));
  // const [selectedOptions, setSelectedOptions] = React.useState(initSelectedOptions);

  React.useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleChange = async (valueList, optionList) => {
    const lastOption = optionList.length ? optionList[optionList.length - 1] : null;
    if (lastOption && !lastOption.value) {
      const name = valueList[valueList.length - 1];
      await createCustomTag(name);
      await context.reloadCustomTags();
    } else {
      setSelected(valueList);
      onChange(valueList);
    }
  }

  return <Container>
    {readonly ?
      <>
        {(context.customTags || [])
          .filter(t => (selected || []).includes(t.id))
          .map((t, i) => <Tag color="#55B0D4" key={i}>{t.name}</Tag>)}
      </>
      :
      <Select
        placeholder="Select tags"
        onClick={e => e.stopPropagation()}
        mode="multiple"
        allowClear={false}
        style={{ width: '100%', marginRight: 8, flex: '1' }}
        onChange={handleChange}
        onBlur={onBlur}
        value={selected}
        notFoundContent={<>Not found</>}
        // value={selectedOptions}
        options={(context.customTags || []).map((t, i) => ({ label: t.name, value: t.id }))}
      />}
  </Container>


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

StockCustomTagSelect.propTypes = {
  // value: PropTypes.string.isRequired,
  value: PropTypes.arrayOf(PropTypes.string),
  readonly: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
};

StockCustomTagSelect.defaultProps = {
  value: [],
  readonly: true,
  onChange: () => { },
  onBlur: () => { },
};

export default StockCustomTagSelect;
