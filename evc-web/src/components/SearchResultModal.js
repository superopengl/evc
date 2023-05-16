import React from 'react';
import { Form, Input, Button, Modal, Space } from "antd";
import styled from 'styled-components';
import { saveContact } from 'services/contactService';
import { notify } from 'util/notify';
import { GlobalContext } from 'contexts/GlobalContext';
import PropTypes from 'prop-types';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';
import { Link, withRouter } from 'react-router-dom';
import StockList from './StockList';
import { Divider } from 'antd';
import { Alert } from 'antd';
const Container = styled.div`
margin-left: auto;
margin-right: auto;
text-align: left;

p {
  color: #ffffff;

}
`;

const SubmitButton = styled(Button)`
border-width: 2px;
// border-radius: 20px;

&:hover {
  border-color: white;
  color: white;
}
`;
// import emailjs from 'emailjs-com';
const SearchResultModal = props => {
  const { stock } = props;

  const [visible, setVisible] = React.useState(!!stock);
  const [loading, setLoading] = React.useState(false);
  const context = React.useContext(GlobalContext);
  const { role } = context;

  React.useEffect(() => {
    setVisible(!!stock);
  }, [stock])

  const handleSubmit = async values => {
    if (loading) {
      return;
    }

    // console.log(process.env);
    try {
      setLoading(true);

      await saveContact(values);
      notify.success('Successfully sent out the message. We will reply shortly');
    } finally {
      setLoading(false);
      props.onDone();
    }
  }


  const handleCancel = () => {
    props.onDone();
  }

  const getModalTitle = () => {
    if(!stock) return null;
    const first = stock[0];
    return first ? `Recent publish for ${first.company} (${first.symbol})` : null;
  }

  return (
    <Modal
      visible={visible}
      closable={true}
      maskClosable={false}
      onOk={() => setVisible(false)}
      onCancel={() => setVisible(false)}
      footer={null}
      size="large"
    title={getModalTitle()}
    >
      <Space direction="vertical" size="large">

        <Alert type="warning" message="Sign up to get the most recent and up to date publish." showIcon={true} />
        <Divider>
        <Space align="center" style={{ marginLeft: 'auto', marginRight: 'auto', justifyContent: 'center' }} >
          <Button type="primary" onClick={() => props.history.push('/signup')}>Sign Up with Email</Button>
          <GoogleSsoButton
            render={
              renderProps => (
                <Button
                  type="secondary"
                  block
                  icon={<GoogleLogoSvg size={16} />}
                  // icon={<GoogleOutlined />}
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled}
                >Continue with Google</Button>
              )}
          />
        </Space>
        </Divider>
        <StockList data={stock} />
        <Button block ghost type="primary" onClick={() => setVisible(false)}>OK</Button>
      </Space>
    </Modal>
  );
}

SearchResultModal.propTypes = {
  stock: PropTypes.object,
};

SearchResultModal.defaultProps = {
};

export default withRouter(SearchResultModal);
