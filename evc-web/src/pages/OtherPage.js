
// import 'App.css';
import React from 'react';
import { withRouter } from 'react-router-dom';

const OtherPage = (props) => {
  React.useEffect(() => {
    props.history.push('/');
  }, []);
  return null;
};

OtherPage.propTypes = {};

export default withRouter(OtherPage);
