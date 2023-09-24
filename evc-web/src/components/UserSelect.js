import { Select, Typography, Space } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { listAllUsers } from 'services/userService';
const { Text } = Typography;

const StyledSelect = styled(Select)`
min-width: 200px;

// .ant-select-selector {
//   height: 50px !important;
//   padding-top: 4px !important;
//   padding-bottom: 4px !important;
// }

`;

const getDisplayName = (client) => {
  const displayName = `${client.givenName ?? ''} ${client.surname ?? ''}`.trim();
  return displayName || client.email;
}

const UserSelect = (props) => {
  const { value, onChange, showName, ...other } = props;

  const [list, setList] = React.useState([]);

  const loadEntity = async () => {
    const list = await listAllUsers();
    setList(list);
  }

  React.useEffect(() => {
    loadEntity();
  }, []);

  return (
    <StyledSelect allowClear value={value} onChange={onChange} {...other}>
      {list.map(c => (<Select.Option key={c.id} value={c.id}>
        <Space size="small">
          {showName && <div style={{ margin: 0, lineHeight: '1rem' }}>{getDisplayName(c)}</div>}
          <Text style={{ margin: 0, lineHeight: '0.8rem' }} type="secondary"><small>{c.email}</small></Text>
        </Space>
      </Select.Option>))}
    </StyledSelect>
  )
};

UserSelect.propTypes = {
  value: PropTypes.string,
  showName: PropTypes.bool,
  onChange: PropTypes.func,
};

UserSelect.defaultProps = {
  showName: false
};

export default UserSelect;
