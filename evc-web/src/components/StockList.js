import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Row, Col } from 'antd';
import StockInfoCard from './StockInfoCard';


const span = {
  xs: 24,
  sm: 12,
  md: 8,
  lg: 8,
  xl: 8,
  xxl: 6,
}

const StockList = (props) => {

  const { data, onItemClick, showBell, showTags } = props;

  return (<>
    <Row gutter={[10, 10]} align="stretch" style={{ marginBottom: 16 }}>
      {data.map(stock => <Col {...span}>
        <StockInfoCard
          value={stock}
          hoverable
          onClick={() => onItemClick(stock)}
          showBell={showBell}
          showTags={showTags}
        />
      </Col>)}
    </Row>
  </>
  )

};

StockList.propTypes = {
  data: PropTypes.array.isRequired,
  onItemClick: PropTypes.func,
  showBell: PropTypes.bool,
  showTags: PropTypes.bool,
};

StockList.defaultProps = {
  showBell: false,
  showTags: false,
  onItemClick: () => { }
};

export default withRouter(StockList);
