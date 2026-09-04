import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'util/withRouter';
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

  const { data, onItemClick = () => { }, showBell = false, showTags = false } = props;

  return (<>
    <Row gutter={[16, 16]} align="stretch" style={{ marginBottom: 16 }}>
      {data.map(stock => <Col {...span} key={stock.symbol}>
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

export default withRouter(StockList);
