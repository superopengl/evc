import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Divider } from 'antd';

export const SectionTitleDivider = (props) => {
  return (
    <Row wrap={false} align="center" gutter={4}>
      <Col flex="none">{props.title}</Col>
      <Col flex="auto" style={{ display: 'flex', alignItems: 'center' }}><Divider style={{ margin: 0 }} /></Col>
    </Row>
  );
};

SectionTitleDivider.propTypes = {
  title: PropTypes.any,
};

SectionTitleDivider.defaultProps = {
}