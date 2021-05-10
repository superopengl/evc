import { Typography, Modal, Divider } from 'antd';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';

const { Paragraph } = Typography;

const gitVersion = process.env.REACT_APP_GIT_HASH;

const AboutDrawer = (props) => {

  const { staticContext, onClose, ...other } = props;

  return (
    <Modal
      title="About"
      placement="bottom"
      destroyOnClose={false}
      maskClosable={true}
      footer={null}
      onOk={() => onClose()}
      onCancel={() => onClose()}
      {...other}
    >
      <Paragraph>
        All data provided on Easy Value Check is provided to individuals for informational purposes only, and is not intended for trading or investing purposes. You must not redistribute information displayed on or provided by Easy Value Check.
      </Paragraph>
      <Divider />
      <Paragraph>©{new Date().getFullYear()} Easy Value Check. All right reserved.</Paragraph>
      <Paragraph>Version {gitVersion}</Paragraph>
      <Paragraph>
        <a href="/terms_and_conditions" target="_blank">
          <FormattedMessage id="menu.tc" />
        </a> | <a href="/privacy_policy" target="_blank">
          <FormattedMessage id="menu.pp" />
        </a> | <a href="/disclaimer" target="_blank">
          <FormattedMessage id="menu.disclaimer" />
        </a></Paragraph>
      {/* <Divider />
      <Link href="https://www.techseeding.com.au" target="_blank">
        Technical solution by TECHSEEDING PTY LTD.
        <br />https://www.techseeding.com.au
      <div style={{ marginTop: 5 }}><img src="https://www.techseeding.com.au/logo-bw.png" width="120px" height="auto" alt="Techseeding logo"></img></div>
      </Link> */}
    </Modal>
  );
};

AboutDrawer.propTypes = {};

AboutDrawer.defaultProps = {};

export default withRouter(AboutDrawer);
