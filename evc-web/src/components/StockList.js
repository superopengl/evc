import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { List } from 'antd';
import StockInfoCard from './StockInfoCard';
import styled from 'styled-components';

const StyledList = styled(List)`
.ant-list-item {
  padding: 0;
}
`;

const StockList = (props) => {

  const { data, loading, onItemClick, showBell } = props;

  return (
    <StyledList
      grid={{
        gutter: 10,
        xs: 1,
        sm: 2,
        md: 3,
        lg: 3,
        xl: 3,
        xxl: 4,
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
          showBell={showBell}
          />
        </List.Item>
      )}
    />
  )

};

StockList.propTypes = {
  data: PropTypes.array.isRequired,
  onItemClick: PropTypes.func,
  showBell: PropTypes.bool,
};

StockList.defaultProps = {
  showBell: false,
  onItemClick: () => {}
};

export default withRouter(StockList);
