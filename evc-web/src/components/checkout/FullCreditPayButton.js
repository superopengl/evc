import React from 'react';
import { Button } from 'antd';
import PropTypes from 'prop-types';
import * as _ from 'lodash';


const FullCreditPayButton = (props) => {
  const { onProvision, onCommit, onLoading } = props;
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    onLoading(loading);
  }, [loading]);

  const handleFullCreditPay = async () => {
    try {
      setLoading(true);
      const { paymentId } = await onProvision();
      await onCommit(paymentId);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="primary" block onClick={handleFullCreditPay}
      disabled={loading}
      loading={loading}
    >Purchase with credits</Button>
  );
}

FullCreditPayButton.propTypes = {
  onProvision: PropTypes.func.isRequired,
  onCommit: PropTypes.func.isRequired,
  onLoading: PropTypes.func.isRequired,
};

FullCreditPayButton.defaultProps = {
};

export default FullCreditPayButton;
