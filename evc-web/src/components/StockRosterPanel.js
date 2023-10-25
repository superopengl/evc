import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Space, List } from 'antd';
import { withRouter } from 'react-router-dom';
import { getStockRoster } from 'services/stockService';
import { Loading } from './Loading';
import styled from 'styled-components';
import ReactDOM from 'react-dom';
import { from } from 'rxjs';

const { Text } = Typography;


const RosterList = styled(List)`
.ant-list-item {
  padding-left: 0;
  padding-right: 0;
}
`;

const StockRosterPanel = (props) => {

  const { symbol } = props;
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getStockRoster(symbol) ?? [];
      ReactDOM.unstable_batchedUpdates(() => {
        setData(data);
        setLoading(false);
      })
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const load$ = from(loadData()).subscribe();

    return () => {
      load$.unsubscribe();
    }
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
        dataSource={data}
        renderItem={item => (
          <List.Item>
            <Space style={{width: '100%', justifyContent: 'space-between', borderBottom: '1px dotted rgba(0,0,0,0.1)'}}>
              <Text>{item.entityName}</Text>
              <Text>{item.position?.toLocaleString()}</Text>
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
