
import React from 'react';
import styled from 'styled-components';
import { Typography, Listy, Spin, Drawer } from 'antd';
import PropTypes from 'prop-types';
import MoneyAmount from 'components/MoneyAmount';
import { ListyItemMeta } from 'components/ListyItemMeta';
import { TimeAgo } from 'components/TimeAgo';
import { getSubscriptionName } from 'util/getSubscriptionName';
import sumBy from 'lodash/sumBy';
import { from } from 'rxjs';
import { FormattedMessage } from 'react-intl';

const { Text } = Typography;

// List -> Listy. `size="small"` and the drawer's own .ant-list-item override both collapse
// into Listy's styles.item.
const ITEM_STYLE = { padding: '8px 0' }

const CreditHistoryListDrawer = (props) => {

  const { visible: propVisible = false, onFetch, onOk } = props;
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
    const load$ = from(loadList(propVisible)).subscribe();
    return () => {
      load$.unsubscribe();
    }
  }, [propVisible]);

  const total = sumBy(data, x => (+x.amount) || 0);

  return (
    <Drawer
      title={<FormattedMessage id="text.creditHistory" />}
      open={visible}
      closable={true}
      maskClosable={true}
      destroyOnClose={false}
      onClose={() => onOk()}
      width={400}
      footer={
        <>
          <Text strong>Sub Total</Text>
          <MoneyAmount style={{ fontSize: '1.5rem', marginLeft: '1rem' }} type="success" strong value={total} />
        </>

      }
      footerStyle={{ textAlign: 'right' }}
    >
      <Spin spinning={loading}>
        <Listy
          items={data}
          rowKey="id"
          styles={{ item: ITEM_STYLE }}
          itemRender={item => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ListyItemMeta
                description={<TimeAgo value={item.createdAt} />}
                title={item.referredUserEmail || getSubscriptionName(item.type)}
              />
              <MoneyAmount type={item.amount < 0 ? 'danger' : 'success'} value={item.amount} />
            </div>
          )}
        />
      </Spin>
    </Drawer>
  )
};



CreditHistoryListDrawer.propTypes = {
  visible: PropTypes.bool.isRequired,
  onFetch: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
};

export default CreditHistoryListDrawer;
