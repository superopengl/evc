
import React from 'react';
import { Select } from 'antd';
import countryList from 'react-select-country-list'
import {sortBy} from 'lodash';

const countries = countryList().native();
const COUNTRY_LIST = sortBy(countries.getData().map(x => ({
  ...x,
  label: countries.getLabel(x.value)
})), 'label');
const OPTIONS = COUNTRY_LIST.map((x, i) => <Select.Option key={i} value={x.value}>{x.label}</Select.Option>);

export const CountrySelector = props => {
  return (
    <Select {...props}
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
    >
      {OPTIONS}
    </Select>
  )
}