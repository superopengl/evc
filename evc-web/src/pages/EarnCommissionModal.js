import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Space, Button, Typography, Modal } from 'antd';
import { changePassword } from 'services/userService';
import { notify } from 'util/notify';
import ReactDOM from 'react-dom';
import { getMyAccount, listMyCreditHistory } from 'services/accountService';
import ReferralLinkInput from 'components/ReferralLinkInput';
import { FormattedMessage } from 'react-intl';

const { Paragraph, Text, Title } = Typography;

const EarnCommissionModal = props => {

  const {onOk} = props;

  const [loading, setLoading] = React.useState(false);
  const [account, setAccount] = React.useState({});

  const load = async () => {
    try {
      setLoading(true);
      const account = await getMyAccount();

      ReactDOM.unstable_batchedUpdates(() => {
        setAccount(account);
        setLoading(false);
      })
    } catch (e) {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load(false);
  }, []);

  return (
    <Modal
      title={<FormattedMessage id="menu.earnCommission"/>}
      width={680}
      closable={true}
      maskClosable={true}
      destroyOnClose={true}
      footer={null}
      {...props}>
      <Paragraph type="secondary"><FormattedMessage id="text.shareReferralLink"/></Paragraph>
      <ReferralLinkInput value={account?.referralUrl} />
      <Space style={{width: '100%', justifyContent: 'flex-end', marginTop: 20}}>
        <Link to="/account"><Button type="primary" ghost onClick={onOk}>Subscription Deduction</Button></Link>
        <Link to="/account"><Button type="primary" onClick={onOk}>Go to Commission Withdrawal</Button></Link>
      </Space>
    </Modal>
  )
}

EarnCommissionModal.propTypes = {};

EarnCommissionModal.defaultProps = {};

export default withRouter(EarnCommissionModal);
