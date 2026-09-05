import { Drawer, Space, Input, Button } from 'antd';
import React from 'react';
import { withRouter } from 'util/withRouter';
import { changeCommissionWithdrawalStatus } from 'services/commissionService';
import CommissionWithdrawalCard from './CommissionWithdrawalCard';
import PropTypes from 'prop-types';
import { CloseOutlined, CheckOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { modal } from 'util/antdStatic';

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
    modal.confirm({
      icon: <ExclamationCircleOutlined />,
      title: 'Reject the withdrawal application',
      mask: { closable: true },
      closable: false,
      onOk: () => handleChangeStatus('rejected'),
      okText: 'Reject',
      okButtonProps: {
        danger: true
      }
    })
  }

  const handleApprove = async () => {
    modal.confirm({
      icon: <ExclamationCircleOutlined />,
      title: 'Complete the withdrawal application',
      content: <><strong>${item.amount}</strong> will be deducted from the user's credit.</>,
      mask: { closable: true },
      closable: false,
      onOk: () => handleChangeStatus('done'),
      okText: 'Complete',
      okButtonProps: {
      }
    })
  }

  const disabled = loading || item?.status === 'rejected' || item?.status === 'done';

  return (
    <Drawer
      open={!!item}
      title={<FormattedMessage id="text.commissionWithdrawalApplication"/>}
      size={600}
      destroyOnHidden={true}
     
      onClose={() => onClose(false)}
      footer={<Space orientation="vertical" style={{ width: '100%', marginBottom: 10 }}>
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
          <Button type="primary" disabled={disabled} loading={loading} icon={<CheckOutlined />} onClick={handleApprove}>Complete</Button>
        </Space>
      </Space>} mask={{ closable: true }}>
      {item && <CommissionWithdrawalCard value={item} grid={1} />}
    </Drawer>
  );
};

AdminEditCommissionWithdrawalDrawer.propTypes = {
  value: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default withRouter(AdminEditCommissionWithdrawalDrawer);
