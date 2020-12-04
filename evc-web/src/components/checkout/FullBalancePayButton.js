import React from 'react';
import { Button } from 'antd';
import PropTypes from 'prop-types';
import * as _ from 'lodash';


const FullBalancePayButton = (props) => {
  const { onProvision, onCommit } = props;
  const [loading, setLoading] = React.useState(false);

  const handleFullBalancePay = async () => {
    try {
      setLoading(true);
      const { paymentId } = await onProvision();
      await onCommit(paymentId);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="primary" block onClick={handleFullBalancePay}
      disabled={loading}
      loading={loading}
    >Purchase without paying</Button>
  );
}

FullBalancePayButton.propTypes = {
  onProvision: PropTypes.func.isRequired,
  onCommit: PropTypes.func.isRequired,
};

FullBalancePayButton.defaultProps = {
};

export default FullBalancePayButton;
