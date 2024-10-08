import React from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { Pagination, Table, Select, Space, Typography, Button, Row, Col, Tooltip, InputNumber, Drawer } from 'antd';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getStockAllOptionPutCallHistory, listLatestOptionPutCall, saveStockOptionPutCallHistoryOrdinal } from 'services/dataService';
import { PlusOutlined, SyncOutlined } from '@ant-design/icons';
import * as moment from 'moment-timezone';
import { Modal } from 'antd';
import { Loading } from 'components/Loading';
import { GlobalContext } from 'contexts/GlobalContext';
import { LockIcon } from '../../components/LockIcon';
import * as _ from 'lodash';
import { Tag } from 'antd';
import { MdOpenInNew } from 'react-icons/md';
import Icon from '@ant-design/icons';

const { Text, Link: TextLink } = Typography;

const ContainerStyled = styled.div`
width: 100%;

.ant-table {
  font-size: 0.8rem;

  td.ant-table-column-sort {
    background-color: #57BB6022;
  }
}

.ant-descriptions-item-label {
  width: 120px;
}

`;


const OptionPutCallPanel = (props) => {
  const { data, singleMode, onOrdinalChange, showsLink } = props;

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);
  const [symbols, setSymbols] = React.useState([]);
  const [filteredSymbol, setFilteredSymbol] = React.useState();
  const [displayList, setDisplayList] = React.useState();
  const [selectedSymbol, setSelectedSymbol] = React.useState();
  const [allData, setAllData] = React.useState(null);
  const context = React.useContext(GlobalContext);

  const shouldHide = context.role === 'free' || context.role === 'guest';
  const isAdmin = context.role === 'admin';

  React.useEffect(() => {
    setList(data);
    setSymbols(_.sortBy(_.union(data.map(d => d.symbol))));
    setLoading(false);

  }, [data]);

  React.useEffect(() => {
    const filtedList = list.filter(s => !filteredSymbol || s.symbol === filteredSymbol).map((x, index) => ({ ...x, index }));
    const sortedList = _.orderBy(filtedList, ['ordinal', 'index']);
    setDisplayList(sortedList);
  }, [list, filteredSymbol])

  const handleShowDetail = async (symbol) => {
    const allHistoryData = await getStockAllOptionPutCallHistory(symbol);
    setSelectedSymbol(symbol);
    setAllData(allHistoryData);
  }

  const handleChangeOrder = async (record, ordinal) => {
    if (_.isNumber(+ordinal) && +(record.ordinal || 0) !== +(ordinal || 0)) {
      await saveStockOptionPutCallHistoryOrdinal(record.symbol, record.tagId, +ordinal);
      onOrdinalChange();
    }
  }

  const handleSymbolChange = (symbol) => {
    setFilteredSymbol(symbol || null);
  }

  const columnDef = [
    {
      fixed: 'left',
      width: 40,
      align: 'center',
      hideOnDetail: true,
      render: (value, record) => <Button shape='circle' size="small" icon={<PlusOutlined />} type="text" onClick={() => handleShowDetail(record.symbol)} disabled={!record.date} />
    },
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      fixed: 'left',
      width: 100,
      hideOnDetail: true,
      // filters: symbols.map(s => ({ text: s, value: s })),
      // filterMode: 'tree',
      // filterSearch: true,
      // onFilter: (value, record) => record.name.startsWith(value),
      // sorter: (a, b) => a.symbol.localeCompare(b.symbol),
      // sortOrder: getSortOrder('symbol'),
      render: (value, record) => !showsLink || record.type === 'INDEX' ? value : <TextLink href={`/stock/${value}`} target='_blank' strong>
        {value} <Icon component={() => <MdOpenInNew />} />
      </TextLink> // <Tooltip title={record.name}>{value}</Tooltip>,
    },
    // {
    //   title: 'Name',
    //   dataIndex: 'name',
    //   // sorter: (a, b) => a.name.localeCompare(b.name),
    //   render: (value) => value,
    // },
    {
      title: 'Date',
      dataIndex: 'date',
      // sorter: (a, b) => moment(a.date) - moment(b.date),
      // width: 135,
      align: 'left',
      render: (value) => {
        if (!value) {
          return <Tag color="warning">Data is coming soon</Tag>
        }
        const dateString = moment.tz(`${value}`, 'utc').format('DD MMM YYYY');
        return dateString;
      }
    },
    {
      title: 'Today Option Volume',
      dataIndex: 'todayOptionVol',
      align: 'right',
      render: (value) => _.isNull(value) ? null : (Math.round(+value)).toLocaleString(),
    },
    {
      title: 'Today %Put Vol',
      dataIndex: 'todayPercentPutVol',
      align: shouldHide ? 'center' : 'right',
      render: (value) => shouldHide ? <LockIcon /> : _.isNull(value) ? null : (+value).toFixed(2) + '%',
    },
    {
      title: 'Today %Call Vol',
      dataIndex: 'todayPercentCallVol',
      align: shouldHide ? 'center' : 'right',
      render: (value) => shouldHide ? <LockIcon /> : _.isNull(value) ? null : (+value).toFixed(2) + '%',
    },
    {
      title: 'Total P/C OI Ratio',
      dataIndex: 'putCallOIRatio',
      align: shouldHide ? 'center' : 'right',
      render: (value) => shouldHide ? <LockIcon /> : _.isNull(value) ? null : (+value).toFixed(3),
    },
    {
      title: 'Total Open Interest',
      dataIndex: 'totalOpenInterest',
      align: 'right',
      render: (value) => _.isNull(value) ? null : (Math.round(+value)).toLocaleString(),
    },
    isAdmin && !singleMode ? {
      title: 'Ordinal (smallest first)',
      dataIndex: 'ordinal',
      align: 'right',
      hideOnDetail: true,
      render: (value, record) => <InputNumber
        defaultValue={value}
        placeholder='ordinal'
        min={1}
        max={9999}
        allowClear
        onBlur={e => handleChangeOrder(record, e.target.value)} />,

    } : null,
  ].filter(x => !!x);


  return (
    <ContainerStyled>
      {!singleMode && <Row style={{ marginBottom: 20 }} align='middle'>
        <Text style={{ marginRight: '1rem' }}>Symbol: </Text>
        <Select allowClear style={{ width: 100 }} placeholder="Symbol"
          // onSearch={handleSymbolChange}
          onChange={handleSymbolChange}
          showSearch
          filterOption={(input, option) => {
            const match = input.toLowerCase();
            const symbol = option.key;
            return symbol.toLowerCase().includes(match);
          }}
        >
          {symbols.map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
        </Select>
      </Row>}
      <Table
        bordered={false}
        size="small"
        columns={columnDef}
        dataSource={displayList}
        loading={loading}
        rowKey="index"
        pagination={!singleMode ? {
          pageSizeOptions: [20, 50, 100],
          defaultPageSize: 50,
          total: list.length,
          showSizeChanger: true,
          showTotal: total => `Total ${total}`,
        } : false}
        // onChange={handleTableSortChange}
        onRow={(record) => {
          return {
            onDoubleClick: () => {
              // handleShowDetail(record.symbol)
            }
          }
        }}
        style={{
          // marginBottom: '1rem',
          // height: 'calc(100vh - 320px)' 
        }}
        scroll={{
          x: 'max-content',
          // y: 'calc(100vh - 370px)'
        }}
      ></Table>
      <Drawer
        title={<><Text strong>{selectedSymbol}</Text> Option History</>}
        visible={!!allData}
        closable={true}
        maskClosable={true}
        onClose={() => setAllData(null)}
        footer={null}
        bodyStyle={{ padding: '0 4px' }}
        width={840}
      >
        <Table
          bordered={false}
          size="small"
          columns={columnDef.filter((x) => !x.hideOnDetail)}
          dataSource={(allData ?? []).map((x, index) => ({ ...x, index }))}
          loading={loading}
          rowKey="index"
          pagination={false}
          style={{
            // marginBottom: '1rem',
            // height: 'calc(100vh - 320px)' 
          }}
          scroll={{
            x: 'max-content',
            // y: 'calc(100vh - 55px)'

          }}
        />
      </Drawer>
    </ContainerStyled>
  );
};

OptionPutCallPanel.propTypes = {
  data: PropTypes.arrayOf(PropTypes.any),
  singleMode: PropTypes.bool,
  onOrdinalChange: PropTypes.func,
  showsLink: PropTypes.bool,
};

OptionPutCallPanel.defaultProps = {
  data: [],
  singleMode: false,
  showsLink: false,
  onOrdinalChange: () => { },
};

export default withRouter(OptionPutCallPanel);
