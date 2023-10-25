import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';
import { withRouter } from 'react-router-dom';
import { listHotStock } from 'services/stockService';
import { StockName } from './StockName';
import { NumberRangeDisplay } from 'components/NumberRangeDisplay';
import { from } from 'rxjs';


const HotStockList = () => {

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const loadList = async () => {
    setLoading(true);
    try {
      const list = await listHotStock();
      setList(list);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const load$ = from(loadList()).subscribe();

    return () => {
      load$.unsubscribe();
    }
  }, []);

  const handleItemClick = () => {

  };

  const columnDef = [
    {
      render: (value, item) => <StockName value={item} direction="vertical" />
    },
    {
      title: 'Value',
      render: (text, item) => <NumberRangeDisplay lo={item.fairValueLo} hi={item.fairValueHi} />
    },
    {
      title: 'Support',
      render: (text, item) => <>
        <NumberRangeDisplay lo={item.supportLo} hi={item.supportHi} />
      </>
    },
    {
      title: 'Resistance',
      render: (text, item) => <>
        <NumberRangeDisplay lo={item.resistanceLo} hi={item.resistanceHi} />
      </>
    },
  ];
  return (
    <Table
      columns={columnDef}
      dataSource={list}
      rowKey="symbol"
      size="small"
      loading={loading}
      pagination={false}
      style={{ width: '100%' }}
      // onChange={handleTableChange}
      // rowClassName={(record) => record.lastUnreadMessageAt ? 'unread' : ''}
      onRow={(item) => ({
        onDoubleClick: () => {
          handleItemClick(item);
        }
      })}
    />
  );
};

HotStockList.propTypes = {
  size: PropTypes.number.isRequired,
};

HotStockList.defaultProps = {
  size: 6,
};

export default withRouter(HotStockList);
