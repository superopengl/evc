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
    background-color: rgba(23,182,73,0.1);
  }
}
`;

const ReferralLinkInput = (props) => {

  const { value } = props;
  const MESSAGE_BEFORE_COPY = 'Click to copy to clipboard';
  const MESSAGE_AFTER_COPY = 'Copied';

  const [tipMessage, setTipMessage] = React.useState(MESSAGE_BEFORE_COPY);

  const handleCopied = (text, result) => {
    if (result) {
      setTipMessage(MESSAGE_AFTER_COPY);
    }
  }

  const handleTipVisibleChange = (visible) => {
    if (visible) {
      setTipMessage(MESSAGE_BEFORE_COPY);
    }
  }

  return (
    <Tooltip title={tipMessage} onVisibleChange={handleTipVisibleChange}>
      <CopyToClipboard text={value} onCopy={handleCopied}>
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
