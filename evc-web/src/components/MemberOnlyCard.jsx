import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';
import styled from 'styled-components';
import { MemberOnlyPanel } from 'components/MemberOnlyPanel';
import { GlobalContext } from 'contexts/GlobalContext';

const StyledCard = styled(Card)`
// margin-bottom: 30px;

.ant-card-head {
  background-color: #3f9e48;
  // background-image: linear-gradient(-45deg, #89DFF1, #89DFF1 25%, #55B0D4 25%, #55B0D4 50%, #7DD487 50%, #7DD487 75%, #3f9e48 75%, #3f9e48 100%);

  .ant-card-head-title {
    color: rgba(255,255,255,0.9);
  }
}
`;

export const MemberOnlyCard = (props) => {
  // `styles`, not `bodyStyle`: antd 6 deprecates the flat style props in favour of one semantic
  // `styles` object, and this took its own name straight from the antd one it forwards. Because
  // that forwarding went through {...otherProps}, grepping for `bodyStyle=` on a <Card> would
  // never have found the six call sites in StockDisplayPanel.
  const { paidOnly = false, message, children, blockedComponent, styles: propStyles, ...otherProps } = props;
  const context = React.useContext(GlobalContext);
  const { role } = context;
  const shouldBlock = paidOnly && !['admin', 'agent', 'member'].includes(role);

  const bodyStyle = shouldBlock ? {
    ...propStyles?.body,
    overflow: 'auto',
    backgroundColor: 'rgba(0, 41, 61, 0.1)',
  } : {
    ...propStyles?.body,
    overflow: 'auto'
  };
  const headStyle = shouldBlock ?
    {
      // backgroundColor: 'rgba(0, 41, 61, 0.8)',
      // color: 'rgba(255,255,255,0.75)'
    } :
    {
      // backgroundColor: 'rgba(0, 41, 61, 0.1)',
      // backgroundColor: '#55B0D4',
      // color: 'rgba(255,255,255,0.75)'
      color: '#00293d'
    };
  return (
    <StyledCard
      type="inner"
      variant="borderless"
      {...otherProps}
      styles={{ ...propStyles, body: bodyStyle, header: headStyle }}
      size="small"
    >
      {shouldBlock ? <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <MemberOnlyPanel message={message} />{blockedComponent}
      </div> : children}
    </StyledCard>
  );
};

MemberOnlyCard.propTypes = {
  paidOnly: PropTypes.bool,
  message: PropTypes.string,
  blockedComponent: PropTypes.any,
};

