import { List, Drawer, Space, Input, Button } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { changeCommissionWithdrawalStatus, listMyCommissionWithdrawal } from 'services/commissionService';
import CommissionWithdrawalCard from './CommissionWithdrawalCard';
import PropTypes from 'prop-types';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';

const AdminEditCommissionWithdrawalDrawer = (props) => {
  const { value, onClose } = props;

  const [item, setItem] = React.useState(value);
  const [loading, setLoading] = React.useState(false);
  const [list, setList] = React.useState([]);
  const [comment, setComment] = React.useState(value?.comment);

  React.useEffect(() => {
    setItem(value);
    setComment(value?.comment);
  }, [value]);

  const handleChangeStatus = async (status) => {
    try {
      setLoading(true);
      const list = await changeCommissionWithdrawalStatus(item.id, status, comment);
      setList(list);
    } catch {
      setLoading(false);
    }
    onClose(true);
  }

  const handleReject = async () => {
    await handleChangeStatus('rejected');
  }

  const handleApprove = async () => {
    await handleChangeStatus('done');
  }

  const disabled = loading || item?.status === 'rejected' || item?.status === 'done';

  return (
    <Drawer
      visible={!!item}
      title="Commission Withdrawal Application"
      width={600}
      destroyOnClose={true}
      maskClosable={true}
      onClose={() => onClose(false)}
      footer={<Space direction="vertical" style={{ width: '100%', marginBottom: 10 }}>
        <Input.TextArea
          placeholder="Comments"
          allowClear
          showCount
          maxLength={2000}
          value={comment}
          disabled={disabled}
          autoSize={{ minRows: 4, maxRows: 10 }}
          onChange={e => setComment(e.target.value)} />
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button danger type="primary" disabled={disabled} loading={loading} icon={<CloseOutlined />} onClick={handleReject}>Reject</Button>
          <Button type="primary" disabled={disabled} loading={loading} icon={<CheckOutlined />} onClick={handleApprove}>Approve and Complete</Button>
        </Space>
      </Space>}
    >
      {item && <CommissionWithdrawalCard value={item} grid={1} />}
    </Drawer>
  );
};

AdminEditCommissionWithdrawalDrawer.propTypes = {
  value: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

AdminEditCommissionWithdrawalDrawer.defaultProps = {
};

export default withRouter(AdminEditCommissionWithdrawalDrawer);
