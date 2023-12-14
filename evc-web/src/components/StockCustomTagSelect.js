import React from 'react';
import PropTypes from 'prop-types';
import { Tag as AntdTag, Select, Dropdown, Button, Space } from 'antd';
import Tag from './Tag';
import { v4 as uuidv4 } from 'uuid';
import { GlobalContext } from 'contexts/GlobalContext';
import { CheckOutlined, TagsOutlined } from '@ant-design/icons';
import { createCustomTags } from 'services/watchListService';


function convertTagsToOptions(customTags) {
  return (customTags || []).map(t => <Select.Option key={t.id} value={t.id}>
    {t.name}
  </Select.Option>);
}

const StockCustomTagSelect = (props) => {

  const { value, onSave } = props;
  const context = React.useContext(GlobalContext);
  const [selected, setSelected] = React.useState(value);

  const allOptions = convertTagsToOptions(context.customTags);

  // const initSelectedOptions = allOptions.filter(x => selectedTagIds?.some(tagId => tagId === x.value));
  // const [selectedOptions, setSelectedOptions] = React.useState(initSelectedOptions);


  const handleChange = async (valueList, optionList) => {
    const [name] = valueList;
    const [item] = optionList;
    if (!item.key) {
      await createCustomTags(name);
    }
  }

  const handleSave = async () => {
    onSave();
  }

  return <div style={{ width: '100%', display: 'flex' }}>
    <Select
      placeholder="Select tags or type new tag"
      onClick={e => e.stopPropagation()}
      mode="tags"
      style={{ width: '100%', marginRight: 8, flex: '1' }}
      onChange={handleChange}
      value={selected}
    // value={selectedOptions}
    >
      {allOptions}
    </Select>
    <Button type="primary" icon={<CheckOutlined/>} onClick={handleSave}/>
  </div>


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
  onSave: PropTypes.func,
};

StockCustomTagSelect.defaultProps = {
  value: [],
  onSave: () => { },
};

export default StockCustomTagSelect;
