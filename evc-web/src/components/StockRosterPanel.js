import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Space, List, Descriptions } from 'antd';
import { withRouter } from 'react-router-dom';
import { getStockInsider } from 'services/stockService';
import { Loading } from './Loading';
import styled from 'styled-components';
import ReactDOM from 'react-dom';
import { GlobalContext } from 'contexts/GlobalContext';

const { Text } = Typography;


const RosterList = styled(List)`
.ant-list-item {
  padding-left: 0;
  padding-right: 0;
}
`;

const RosterCard = styled(Card)`
.ant-card-body {
  padding: 12px;
}
`;


const StockRosterPanel = (props) => {

  const { symbol } = props;
  const [data, setData] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const context = React.useContext(GlobalContext);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getStockInsider(symbol);
      ReactDOM.unstable_batchedUpdates(() => {
        setData(data);
        setLoading(false);
      })
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, []);

  return (
    <Loading loading={loading}>
      <RosterList
        grid={{
          gutter: 10,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 1,
          xl: 1,
          xxl: 1
        }}
        itemLayout="horizontal"
        size="small"
        dataSource={data.roster}
        renderItem={item => (
          <List.Item>
            <Space style={{width: '100%', justifyContent: 'space-between'}}>
              <Text>{item.entityName}</Text>
              <Text>{item.position.toLocaleString()}</Text>
            </Space>
          </List.Item>
        )}
      />
    </Loading>
  );
};

StockRosterPanel.propTypes = {
  symbol: PropTypes.string.isRequired
};

StockRosterPanel.defaultProps = {
};

export default withRouter(StockRosterPanel);
