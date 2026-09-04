import { Listy, Spin, Drawer } from 'antd';
import React from 'react';
import { withRouter } from 'util/withRouter';
import { listMyCommissionWithdrawal } from 'services/commissionService';
import CommissionWithdrawalCard from './CommissionWithdrawalCard';
import { FormattedMessage } from 'react-intl';
import { from } from 'rxjs';

const MyCommissionWithdrawalHistoryDrawer = (props) => {
  const { visible, onClose } = props;

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

  const loadSubscrptions = async () => {
    try {
      setLoading(true);
      const list = await listMyCommissionWithdrawal();
      setList(list);
      setLoading(false);
      
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    let load$;
    if (visible) {
      load$?.unsubscribe();
      load$ = from(loadSubscrptions()).subscribe();
    }

    return () => {
      load$?.unsubscribe();
    }
  }, [visible]);

  return (
    <Drawer
      title={<FormattedMessage id="text.commissionWithdrawalApplication" />}
      size="80vw"
      destroyOnHidden={true}
     
      closable={true}
      open={visible}
      onClose={onClose} mask={{ closable: true }}>
      {/* List -> Listy. The single-column grid was a plain stack; its 20px row gutter is now
          the item's block padding, and `loading` becomes an explicit Spin. */}
      <Spin spinning={loading}>
        <Listy
          items={list}
          rowKey="id"
          styles={{ item: { paddingInline: 0, paddingBlock: 10, border: 'none' } }}
          itemRender={item => <CommissionWithdrawalCard value={item} />}
        />
      </Spin>
    </Drawer>
  );
};

MyCommissionWithdrawalHistoryDrawer.propTypes = {};

export default withRouter(MyCommissionWithdrawalHistoryDrawer);
