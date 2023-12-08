import React from 'react';
import { withRouter } from 'react-router-dom';
import { Typography, Button, Form, Input } from 'antd';
import PropTypes from 'prop-types';
import { saveProfile } from 'services/userService';
import { notify } from 'util/notify';
import { LocaleSelector } from 'components/LocaleSelector';
import { CountrySelector } from 'components/CountrySelector';

const { Link } = Typography;

const ProfileForm = (props) => {
  const { user, initial, onOk, refreshAfterLocaleChange } = props;
  const [loading, setLoading] = React.useState(false);
  const [profile] = React.useState(user.profile || user);

  const handleRefreshPage = () => {
    window.location.reload(false);
  }

  const handleSave = async (values) => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      const result = await saveProfile(user.id, values);

      if (result) {
        if (refreshAfterLocaleChange) {
          const hasLocaleChanged = profile.locale !== values.locale;

          notify.success(
            'Successfully saved profile!',
            hasLocaleChanged ? <>You have changed locale. Please <Link onClick={handleRefreshPage}>Refresh</Link> the page to catch up the locale change</> : null
          );

          Object.assign(profile, values);
        }
        onOk(user);
      }
    } finally {
      setLoading(false);
    }
  }

  const isBuiltinAdmin = profile.email === 'system@easyvaluecheck.com';

  return (
    <Form layout="vertical" onFinish={handleSave} style={{ textAlign: 'left' }} initialValues={profile}>
      {!initial && <Form.Item
        label="Email"
        name="email" rules={[{ required: true, type: 'email', whitespace: true, max: 100, message: ' ' }]}>
        <Input placeholder="abc@xyz.com" type="email" autoComplete="email" allowClear={true}
          disabled={isBuiltinAdmin || true}
          maxLength="100" />
      </Form.Item>}
      <Form.Item label="Given Name" name="givenName" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}>
        <Input placeholder="Given name" autoComplete="given-name" allowClear={true} maxLength="100" autoFocus />
      </Form.Item>
      <Form.Item label="Surname" name="surname" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}>
        <Input placeholder="Surname" autoComplete="family-name" allowClear={true} maxLength="100" />
      </Form.Item>
      <Form.Item label="Phone" name="phone" rules={[{ required: false, whitespace: true, max: 100, message: ' ' }]}>
        <Input placeholder="Phone number" autoComplete="tel" allowClear={true} maxLength="100" />
      </Form.Item>
      <Form.Item label="Address" name="address" rules={[{ required: false, whitespace: true, max: 200, message: ' ' }]}>
        <Input placeholder="Residence address" autoComplete="address" allowClear={true} maxLength="200" />
      </Form.Item>
      <Form.Item label="Residence country" name="country" rules={[{ required: true, whitespace: true, max: 50, message: ' ' }]}>
        <CountrySelector />
      </Form.Item>
      <Form.Item label="Language" name="locale"
        rules={[{ required: true, whitespace: true, max: 200, message: ' ' }]}
        help="Requires refreshing page to pick up the change."
      >
        <LocaleSelector />
      </Form.Item>
      <Form.Item style={{ marginTop: '1rem' }}>
        <Button block type="primary" htmlType="submit" disabled={loading}>Save</Button>
      </Form.Item>
    </Form>
  );
}

ProfileForm.propTypes = {
  user: PropTypes.any.isRequired,
  initial: PropTypes.bool,
  refreshAfterLocaleChange: PropTypes.bool,
};

ProfileForm.defaultProps = {
  initial: false,
  refreshAfterLocaleChange: true
};

export default withRouter(ProfileForm);
