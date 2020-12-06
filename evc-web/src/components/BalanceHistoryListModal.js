
import React from 'react';
import styled from 'styled-components';
import { Modal, List, Drawer } from 'antd';
import PropTypes from 'prop-types';
import MoneyAmount from 'components/MoneyAmount';
import { TimeAgo } from 'components/TimeAgo';

const BalanceHistoryListModal = (props) => {

  const { visible: propVisible, onFetch, onOk } = props;
  const [visible, setVisible] = React.useState(propVisible);
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState();

  const loadList = async (visible) => {
    setVisible(visible);
    if (visible) {
      try {
        setLoading(true);
        setData(await onFetch());
      } finally {
        setLoading(false);
      }
    }
  };

  React.useEffect(() => {
    loadList(propVisible);
  }, [propVisible]);

  return (
    <Drawer
      title="Balance History"
      visible={visible}
      closable={true}
      maskClosable={true}
      destroyOnClose={false}
      onClose={() => onOk()}
      // onCancel={() => onOk()}
      footer={null}
      width={400}
    >
      <List
        loading={loading}
        dataSource={data}
        size="small"
        renderItem={item => {
          return <List.Item>
            <List.Item.Meta 
            description={<TimeAgo value={item.createdAt} />} 
            title={item.referredUserEmail} 
            />
            <MoneyAmount strong type="success" value={item.amount} />
          </List.Item>
        }}
      />
    </Drawer>
  )
};



BalanceHistoryListModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onFetch: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
};

BalanceHistoryListModal.defaultProps = {
  visible: false
};

export default BalanceHistoryListModal;
