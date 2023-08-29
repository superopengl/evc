import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'antd';
import { withRouter } from 'react-router-dom';
import { List } from 'antd';
import StockInfoCard from './StockInfoCard';


const StockList = (props) => {

  const { data, loading, onItemClick } = props;

  return (
    <List
      grid={{
        gutter: 10,
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4,
        xl: 4,
        xxl: 6,
      }}
      size="small"
      loading={loading}
      dataSource={data}
      renderItem={stock => (
        <List.Item>
          <StockInfoCard 
          value={stock}
          hoverable
          onClick={() => onItemClick(stock)}
          />
        </List.Item>
      )}
    />
  )

};

StockList.propTypes = {
  data: PropTypes.array.isRequired,
  onItemClick: PropTypes.func,
};

StockList.defaultProps = {
  onItemClick: () => {}
};

export default withRouter(StockList);
