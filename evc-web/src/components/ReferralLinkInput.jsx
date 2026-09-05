import { Button, Input, Space } from 'antd';
import React from 'react';
import { CopyOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Tooltip } from 'antd';

import styled from 'styled-components';

// The whole widget is one click-to-copy target, so the tint follows a hover anywhere in the
// group rather than sitting on the input alone - hence the wrapper carrying it. Under
// `addonBefore` the input was nested inside antd's group wrapper and `& .ant-input` reached it;
// a bare <Input> renders .ant-input as its own root, so that descendant selector would have
// quietly stopped matching.
const CopyGroup = styled(Space.Compact)`
width: 100%;

&:hover {
  .ant-input,
  .ant-btn {
    background-color: rgba(63, 158, 72,0.1);
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
    <Tooltip title={tipMessage} onOpenChange={handleTipVisibleChange}>
      <CopyToClipboard text={value} onCopy={handleCopied}>
        <div>
          {/* antd 6 deprecates addonBefore in favour of Space.Compact. The addon was a static
              grey box; as a Button it looks the same joined to the input, but is now a real
              target for the copy action the Tooltip already advertises. */}
          <CopyGroup>
            <Button icon={<CopyOutlined />} />
            <Input value={value} readOnly={true} />
          </CopyGroup>
        </div>
      </CopyToClipboard>
    </Tooltip>
  )
};

ReferralLinkInput.propTypes = {
  value: PropTypes.string,
};

export default ReferralLinkInput;
