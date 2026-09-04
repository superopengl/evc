
import React from 'react';
import { Listy, Spin, Typography, Space, Button, Tooltip, Alert, Tag, Badge } from 'antd';
import PropTypes from 'prop-types';
import MoneyAmount from 'components/MoneyAmount';
import { ListyItemMeta } from 'components/ListyItemMeta';
import styled from 'styled-components';
import { StockEpsInput } from './StockEpsInput';
import { ConfirmDeleteButton } from './ConfirmDeleteButton';
import { syncStockEps } from 'services/stockService';
import { SyncOutlined } from '@ant-design/icons';
import { from } from 'rxjs';
import dayjs from 'util/dayjs';
const { Text } = Typography;

const Container = styled.div`
  .current-published {
    background-color: rgba(87,187,96, 0.1);
  }
`;

// A plain antd List laid its items out with `8px 0` at size="small"; Listy defaults to
// `12px 16px`, so both axes have to be restated or every row gains a 16px inset.
const SMALL_ITEM_STYLE = { paddingBlock: 8, paddingInline: 0 };


const StockEpsAdminEditor = (props) => {
  const { onLoadList, onSaveNew, onDelete, onChange = () => { }, onSelected = () => { }, showTime = true } = props;
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

  const updateList = list => {
    setList(list);
    onChange(list);
  }

  const loadEntity = async () => {
    try {
      setLoading(true);
      updateList(await onLoadList());
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const load$ = from(loadEntity()).subscribe();

    return () => {
      load$.unsubscribe();
    }
  }, []);

  const handleSave = async (range) => {
    try {
      setLoading(true);
      await onSaveNew(range);
      updateList(await onLoadList());
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteItem = async (item) => {
    try {
      setLoading(true);
      await onDelete(item.symbol, item.reportDate);
      updateList(await onLoadList());
    } finally {
      setLoading(false);
    }
  }

  const handleSyncEps = async () => {
    try {
      setLoading(true);
      await syncStockEps(props.symbol);
      loadEntity();
    } finally {
      setLoading(false);
    }
  }

  return <Container>
    <Space size="small" orientation="vertical" style={{ width: '100%' }}>
      <Alert description={<>
        It's required to have at least 16 EPS values (back to one and half years ago) to calculate fair values.<br />
        Manually adding EPS value is a heavy operation as it will cause system to recalculate many values like PE90 and fair values.
      </>}
        type="info"
        showIcon
      />
      <Space size="small" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <StockEpsInput onSave={handleSave} disabled={loading} />
        <Tooltip title="Fetch last 16 EPS from AlphaVantage" placement="topRight">
          <Button type="primary" disabled={loading} onClick={() => handleSyncEps()} loading={loading} icon={<SyncOutlined />}></Button>
        </Tooltip>
      </Space>
      {/* List -> Listy. List.Item's `onClick` and `extra` have no equivalent on Listy (it owns
          the item wrapper), so the row becomes a flex box inside itemRender. `size="small"`
          is styles.item, `loading` is a Spin, and `locale.emptyText` is unnecessary because
          Listy renders nothing for an empty list. */}
      <Spin spinning={loading}>
        <Listy
          items={list}
          // StockEps is keyed on (symbol, reportDate) - it has no `id`. The old
          // `rowKey="id"` was already wrong, but antd List silently fell back to the row
          // index; Listy requires a real key, so this now uses the one that exists.
          rowKey="reportDate"
          styles={{ item: SMALL_ITEM_STYLE }}
          itemRender={item => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => onSelected(item)}>
                <ListyItemMeta
                  description={<Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text type="secondary"><small>{dayjs(item.reportDate).format('D MMM YYYY')}</small>
                      {item.source === 'evc' && <Tooltip title="Manually input EPS"><Badge status="success" style={{ marginLeft: 4 }} /></Tooltip>}
                    </Text>
                    <MoneyAmount symbol="" value={item.value} digital={4} />
                  </Space>}
                />
              </div>
              <ConfirmDeleteButton onOk={() => handleDeleteItem(item)} />
            </div>
          )}
        />
      </Spin>
    </Space>
  </Container>
}

StockEpsAdminEditor.propTypes = {
  onLoadList: PropTypes.func.isRequired,
  onSaveNew: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  onSelected: PropTypes.func,
  showTime: PropTypes.bool,
  symbol: PropTypes.string.isRequired,
};

export default StockEpsAdminEditor;