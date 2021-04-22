import { List, Drawer } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { listMyCommissionWithdrawal } from 'services/commissionService';
import CommissionWithdrawalCard from './CommissionWithdrawalCard';
import ReactDOM from 'react-dom';
import { FormattedMessage } from 'react-intl';


const MyCommissionWithdrawalHistoryDrawer = (props) => {
  const { visible, onClose } = props;

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

  const loadSubscrptions = async () => {
    try {
      setLoading(true);
      const list = await listMyCommissionWithdrawal();
      ReactDOM.unstable_batchedUpdates(() => {
        setList(list);
        setLoading(false);
      })
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (visible) {
      loadSubscrptions();
    }
  }, [visible]);

  return (
    <Drawer
      title={<FormattedMessage id="text.commissionWithdrawalApplication" />}
      width="80vw"
      destroyOnClose={true}
      maskClosable={true}
      closable={true}
      visible={visible}
      onClose={onClose}
    >
      <List
        title={false}
        loading={loading}
        grid={{
          gutter: [0, 20],
          column: 1
        }}
        dataSource={list}
        size="small"
        renderItem={item => {
          return <List.Item style={{ paddingLeft: 0, paddingRight: 0 }}>
            <CommissionWithdrawalCard value={item} />
          </List.Item>
        }}
      />
    </Drawer>
  );
};

MyCommissionWithdrawalHistoryDrawer.propTypes = {};

MyCommissionWithdrawalHistoryDrawer.defaultProps = {};

export default withRouter(MyCommissionWithdrawalHistoryDrawer);
