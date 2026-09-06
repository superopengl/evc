import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Select } from 'antd';
import Tag from './Tag';
import { GlobalContext } from 'contexts/GlobalContext';
import { createCustomTag } from 'services/watchListService';
import styled from 'styled-components';
import { useIntl } from 'react-intl';

const Container = styled.div`
width: 100%;

.ant-select-selection-item-content {
  font-size: 12px;
}
`;

// A border in the tag's own text colour, matching the filter panel above the list
// (StockCustomTagFilterPanel). Inline rather than CSS so it outranks the `border-color`
// antd 6 sets per variant.
const TAG_BORDER_STYLE = { borderColor: 'currentColor' };

const StockCustomTagSelect = (props) => {

  const { value = [], readonly = true, onChange = () => { }, onBlur = () => { } } = props;
  const intl = useIntl();
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
      // antd 6 dropped Tag's default `margin-inline-end`, so a bare list of them runs together.
      // Flex supplies the gap, plus the row gap the old margin never gave when the list wrapped.
      //
      // `processing` is antd's status colour for `colorInfo`, which src/antdTheme.js pins to the
      // brand blue - so the fill tracks the theme instead of a hex repeated per call site. It has
      // to be the preset rather than the raw hex to stay in step with StockCustomTagFilterPanel:
      // under the default `variant="filled"` a custom hex is washed out to l=95% of its own hue,
      // which is close to `colorInfoBg` but not equal to it.
      <Flex wrap gap="small">
        {(context.customTags || [])
          .filter(t => (selected || []).includes(t.id))
          .map((t, i) => <Tag color="processing" style={TAG_BORDER_STYLE} key={i}>{t.name}</Tag>)}
      </Flex>
      :
      <Select
        placeholder={intl.formatMessage({id: 'text.selectTags'})}
        onClick={e => e.stopPropagation()}
        mode="multiple"
        allowClear={false}
        style={{ width: '100%', marginRight: 8, flex: '1' }}
        onChange={handleChange}
        onBlur={onBlur}
        value={selected}
        notFoundContent={intl.formatMessage({id: 'text.notFound'})}
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

export default StockCustomTagSelect;
