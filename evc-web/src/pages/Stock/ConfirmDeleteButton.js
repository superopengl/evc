
import React from 'react';
import { DatePicker, InputNumber, Popover, Button } from 'antd';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import * as _ from 'lodash';
import { Select } from 'antd';

export const ConfirmDeleteButton = (props) => {
  const [visible, setVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleVisibleChange = visible => {
    setVisible(visible);
  }

  const handleDelete = async () => {
    setLoading(true);
    await props.onDelete();
    setVisible(false);
    setLoading(false);
  }

  return <Popover
    title={<>Delete this?</>}
    trigger="click"
    visible={visible}
    onVisibleChange={handleVisibleChange}
    content={<>
      <Button onClick={() => setVisible(false)} disabled={loading}>Cancel</Button>
      <Button style={{marginLeft: 10}} danger type="primary" onClick={handleDelete} disabled={loading}>Yes, delete</Button>
    </>}
  >
    <Button type="link" danger icon={<DeleteOutlined />} disabled={loading} />
  </Popover>
}

ConfirmDeleteButton.propTypes = {
  onDelete: PropTypes.func.isRequired,
};

ConfirmDeleteButton.defaultProps = {
};
