import React from 'react';
import ReactDOM from "react-dom";
import { Tabs, Card } from 'antd';
import { withRouter } from 'react-router-dom';
import OptionPutCallPanel from './OptionPutCallPanel';
import { listLatestOptionPutCall } from 'services/dataService';
import * as _ from 'lodash';
import { Loading } from 'components/Loading';

const OptionPutCallPage = (props) => {

  const [typedMap, setTypedMap] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const load = async () => {
    const resp = await listLatestOptionPutCall();
    ReactDOM.unstable_batchedUpdates(() => {
      const entries = Object.entries(_.groupBy(resp, x => x.type));
      const sortedEntires = _.orderBy(entries, x => x[1][0].sortGroup)
      setTypedMap(sortedEntires);
      setLoading(false);
    });
  }

  React.useEffect(() => {
    load();
  }, []);

  return (
    <Card style={{ backgroundColor: 'white' }} bordered={true}>
      <Loading loading={loading}>
        <Tabs defaultActiveKey="stock" type="card" >
          {
            typedMap.map(([t, data]) => <Tabs.TabPane tab={t} key={t}>
              <OptionPutCallPanel data={data} />
            </Tabs.TabPane>)
          }
        </Tabs>
      </Loading>
    </Card>
  );
};

OptionPutCallPage.propTypes = {};

OptionPutCallPage.defaultProps = {};

export default withRouter(OptionPutCallPage);
