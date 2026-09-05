import React from 'react';
import { Tabs, Card } from 'antd';
import { withRouter } from 'util/withRouter';
import OptionPutCallPanel from './OptionPutCallPanel';
import { listLatestOptionPutCall } from 'services/dataService';
import * as _ from 'lodash';
import { Loading } from 'components/Loading';

const OptionPutCallPage = (props) => {

  const [typedMap, setTypedMap] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const load = async () => {
    setLoading(true);
    const resp = await listLatestOptionPutCall();
    const entries = Object.entries(_.groupBy(resp, x => x.type));
    const sortedEntries = _.orderBy(entries, x => x[1][0].sortGroup)
    setTypedMap(sortedEntries);
    setLoading(false);
    
  }

  React.useEffect(() => {
    load();
  }, []);

  const handleOrdinalChange = () => {
    load();
  }

  return (
    <Card style={{ backgroundColor: 'white' }}>
      <Loading loading={loading}>
        {/* antd 6 keeps `Tabs.TabPane` only as a deprecation shim (`() => null` plus a legacy
            children->items conversion) and drops it in v7. `items` is the supported API. */}
        <Tabs
          defaultActiveKey="stock"
          type="card"
          items={typedMap.map(([t, data]) => ({
            key: t,
            label: t,
            children: <OptionPutCallPanel data={data} tagId={t} onOrdinalChange={handleOrdinalChange} showsLink={true} />,
          }))}
        />
      </Loading>
    </Card>
  );
};

OptionPutCallPage.propTypes = {};

export default withRouter(OptionPutCallPage);
