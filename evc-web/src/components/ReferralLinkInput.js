import { Button, Typography, Input } from 'antd';
import React from 'react';
import { CopyOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Tooltip } from 'antd';

import styled from 'styled-components';

const StyledInput = styled(Input)`
&:hover {
  .ant-input {
    background-color: rgba(21,190,83,0.1);
  }
}
`;

const ReferralLinkInput = (props) => {

  const { value } = props;


  return (
    <Tooltip title="Click to copy to clipboard">
      <CopyToClipboard text={value}>
        <div>
          <StyledInput value={value} addonBefore={<CopyOutlined />} readOnly={true} />
        </div>
      </CopyToClipboard>
    </Tooltip>
  )
};

ReferralLinkInput.propTypes = {
  value: PropTypes.string,
};

ReferralLinkInput.defaultProps = {
};

export default ReferralLinkInput;
