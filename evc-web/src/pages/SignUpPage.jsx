import React from 'react';
import { withRouter } from 'util/withRouter';
import { FormattedMessage } from 'react-intl';
import AuthPageShell from 'components/AuthPageShell';
import SignUpForm from 'components/SignUpForm';

const SignUpPage = (props) => {
  return (
    <AuthPageShell
      eyebrow={<FormattedMessage id="auth.signUpEyebrow" />}
      title={<FormattedMessage id="auth.signUpTitle" />}
      subtitle={<FormattedMessage id="auth.signUpSubtitle" />}
    >
      <SignUpForm showTitle={false} onOk={() => props.history.push('/')} />
    </AuthPageShell>
  );
}

SignUpPage.propTypes = {};

export default withRouter(SignUpPage);
