import React from 'react';
import { withRouter } from 'react-router-dom';
import { Typography, Input, Button, Form, Space, Modal } from 'antd';
import { createStock } from 'services/stockService';
import PropTypes from 'prop-types';
import { GlobalContext } from 'contexts/GlobalContext';
import { notify } from 'util/notify';
import TagSelect from 'components/TagSelect';
import { listStockTags, saveStockTag } from 'services/stockTagService';
import ReactDOM from 'react-dom';
import { from } from 'rxjs';

const { Link } = Typography;

const CreateStockModal = props => {
  const { visible, onOk, onCancel } = props;
  const [sending, setLoading] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(visible);
  const [stockTags, setStockTags] = React.useState([]);
  const context = React.useContext(GlobalContext);

  const Load = async () => {
    setLoading(true);
    const tags = await listStockTags();
    ReactDOM.unstable_batchedUpdates(() => {
      setStockTags(tags);
      setLoading(false);
    })
  }

  React.useEffect(() => {
    const load$ = from(Load()).subscribe();
    return () => {
      load$.unsubscribe();
    }
  }, []);

  React.useEffect(() => {
    setModalVisible(visible);
  }, [visible])


  const validateExsitsSymbol = async (rule, symbol) => {
    return;
  }

  const handleSubmit = async values => {
    if (sending) {
      return;
    }

    try {
      setLoading(true);
      const { symbol } = values;
      await createStock(values);
      onOk();

      context.event$.next({ type: 'stock.created' });

      notify.success(
        <>Successfully created stock <Link strong onClick={() => props.history.push(`/stock/${symbol}`)}>{symbol}</Link>. System may take several minutes to prepare its EPS and historical close prices.</>
      )
    } catch {
      setLoading(false);
    }
  }

  return (
    <Modal
      title="Add New Stock"
      visible={modalVisible}
      destroyOnClose={true}
      onOk={onOk}
      onCancel={onCancel}
      closable={true}
      maskClosable={false}
      footer={null}
    >
      <Form layout="vertical" onFinish={handleSubmit} style={{ textAlign: 'left' }} initialValues={{ symbol: props.defaultSymbol?.toUpperCase() }}>
        <Form.Item label="Symbol" name="symbol"
          rules={[{ required: true, validator: validateExsitsSymbol, whitespace: true, max: 10 }]}
        >
          <Input placeholder="Stock symbol" allowClear={true} maxLength="10" disabled={sending} autoFocus={true} />
        </Form.Item>
        {/* <Form.Item label="Company Name" name="company" rules={[{ required: true, max: 100, message: 'Please input company name' }]}>
          <Input placeholder="Apple Inc." maxLength="100" disabled={sending} />
        </Form.Item> */}
        <Form.Item label="Tags" name="tags">
          <TagSelect tags={stockTags} onSave={saveStockTag} readonly={false} />
        </Form.Item>
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button block onClick={onCancel}>Cancel</Button>
            <Button block type="primary" htmlType="submit" disabled={sending}>Add Stock</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}

CreateStockModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  defaultSymbol: PropTypes.string,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};

CreateStockModal.defaultProps = {
  visible: false,
  defaultSymbol: ''
};

export default withRouter(CreateStockModal);
