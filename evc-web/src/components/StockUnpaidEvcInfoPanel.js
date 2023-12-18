import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Space } from 'antd';
import { withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { TimeAgo } from './TimeAgo';
import styled from 'styled-components';
import { NumberValueDisplay } from './NumberValueDisplay';

const { Text } = Typography;
const SHOW_SUPPORT_RESISTANCE = false;

const OldFairValueContainer = styled.div`
display: flex;
flex-direction: column;
// color: rgba(255, 255, 255, 0.75);
width: 100%;
align-items: center;

.ant-typography {
  // color: rgba(255, 255, 255, 0.75);
}
`;

const BlurPair = props => <Text strong style={{ fontWeight: 900, filter: 'blur(4px)' }}>XXXX ~ XXXX</Text>
const BlurSingle = props => <Text strong style={{ fontWeight: 900, filter: 'blur(4px)' }}>XXXX</Text>

const StockUnpaidEvcInfoPanel = (props) => {

  const { fairValues } = props;

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <FormattedMessage id="text.fairValue" />
        <OldFairValueContainer>
          {fairValues?.length ? fairValues.map((fv, i) => i > 2 ? null : <Space key={i} style={{ width: 200, justifyContent: 'space-between' }} >
            <TimeAgo value={fv.date} showAgo={false} accurate={false} direction="horizontal" />
            {fv.lo ? <NumberValueDisplay value={[fv.lo, fv.hi]} /> : <BlurPair />}
          </Space>) : <BlurPair />}
        </OldFairValueContainer>
      </Space>
      <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <FormattedMessage id="text.forwardNextFyFairValue" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <BlurPair />
        </div>
      </Space>
      <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <FormattedMessage id="text.forwardNextFyMaxValue" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <BlurPair />
        </div>
      </Space>
      <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <FormattedMessage id="text.beta" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <BlurSingle />
        </div>
      </Space>
      <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <FormattedMessage id="text.peRatio" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <BlurSingle />
        </div>
      </Space>
      <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <FormattedMessage id="text.forwardRatio" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <BlurSingle />
        </div>
      </Space>


      {SHOW_SUPPORT_RESISTANCE && <>

        <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <FormattedMessage id="text.support" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <BlurPair />
            <BlurPair />
          </div>
        </Space>
        <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <FormattedMessage id="text.resistance" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <BlurPair />
            <BlurPair />
          </div>
        </Space>
      </>}
    </Space>
  );
};

StockUnpaidEvcInfoPanel.propTypes = {
  fairValues: PropTypes.array.isRequired
};

StockUnpaidEvcInfoPanel.defaultProps = {
};

export default withRouter(StockUnpaidEvcInfoPanel);
