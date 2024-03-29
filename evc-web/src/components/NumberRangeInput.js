
import React from 'react';
import { InputNumber, Space, Button } from 'antd';
import PropTypes from 'prop-types';
import isNumber from 'lodash/isNumber';
import { CheckOutlined } from '@ant-design/icons';

export const NumberRangeInput = (props) => {
  const { onChange, onSave, value, disabled: propsDisabled, readOnly, allowInputNone, showSave } = props;
  const [lo, setLo] = React.useState(value[0]);
  const [hi, setHi] = React.useState(value[1]);
  const [disabled, setDisabled] = React.useState(propsDisabled);

  React.useEffect(() => {
    setLo(value[0]);
    setHi(value[1]);
  }, [value])

  React.useEffect(() => {
    setDisabled(propsDisabled);
  }, [propsDisabled])

  const handleChangeLo = newLo => {
    handleChange(newLo, hi);
  }

  const handleChangeHi = newHi => {
    handleChange(lo, newHi);
  }

  const handleChange = (newLo, newHi) => {
    setLo(newLo);
    setHi(newHi);
    onChange([newLo, newHi]);
  }

  const handleSave = () => {
    onSave([lo, hi]);
    handleChange(null, null);
  }

  const isValidValue = () => {
    const isLoNumber = isNumber(lo);
    const isHiNumber = isNumber(hi);
    if (isLoNumber && isHiNumber) {
      return lo <= hi;
    }
    return allowInputNone || isLoNumber || isHiNumber;
  }

  return <Space>
    <InputNumber placeholder="Low" value={lo} onChange={handleChangeLo} disabled={disabled || readOnly} readOnly={readOnly} />
    <InputNumber placeholder="High" value={hi} onChange={handleChangeHi} disabled={disabled || readOnly} readOnly={readOnly} />
    {showSave && <Button type="primary" icon={<CheckOutlined />} onClick={handleSave} disabled={disabled || !isValidValue()} />}
  </Space>
}

NumberRangeInput.propTypes = {
  onChange: PropTypes.func,
  onSave: PropTypes.func,
  value: PropTypes.array.isRequired,
  showSave: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  allowInputNone: PropTypes.bool,
};

NumberRangeInput.defaultProps = {
  value: [null, null],
  onChange: () => { },
  onSave: () => { },
  showSave: true,
  disabled: false,
  readOnly: false,
  allowInputNone: false
};
