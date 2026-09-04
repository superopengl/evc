
import React from 'react';
import { Listy, Spin, Space, Button } from 'antd';
import PropTypes from 'prop-types';
import { EllipsisOutlined } from '@ant-design/icons';
import { NumberRangeInput } from 'components/NumberRangeInput';
import styled from 'styled-components';
import { ConfirmDeleteButton } from './ConfirmDeleteButton';
import { TimeAgo } from 'components/TimeAgo';
import { from } from 'rxjs';
import { NumberValueDisplay } from 'components/NumberValueDisplay';
import { ListyItemMeta } from 'components/ListyItemMeta';

const Container = styled.div`
  .current-published {
    background-color: rgba(87,187,96, 0.1);
  }
`;

// A plain antd List laid its items out with `8px 0` at size="small"; Listy defaults to
// `12px 16px`, so both axes have to be restated or every row gains a 16px inset.
const SMALL_ITEM_STYLE = { paddingBlock: 8, paddingInline: 0 };


export const StockRangeTimelineEditor = (props) => {
  const { onLoadList, onSaveNew, onChange = () => { }, onDelete = () => { }, onSelected = () => { }, disableInput = false, showTime = true, mode = null } = props;
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

  const updateList = (list) => {
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

  const handleSaveSupport = async (range) => {
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
      await onDelete(item.id);
      updateList(await onLoadList());
    } finally {
      setLoading(false);
    }
  }

  return <Container>
    <Space size="small" orientation="vertical" style={{ width: '100%' }}>
      {!disableInput && <NumberRangeInput onSave={handleSaveSupport} disabled={loading} />}
      {/* List -> Listy. List.Item's `onClick`/`extra` move inside itemRender since Listy owns
          the item wrapper, `loadMore` is just rendered after the list, `size="small"` is
          styles.item and `loading` is a Spin. */}
      <Spin spinning={loading}>
        <Listy
          items={list}
          rowKey="id"
          styles={{ item: SMALL_ITEM_STYLE }}
          itemRender={item => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
              <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => onSelected(item)}>
                <ListyItemMeta
                  description={<Space size="small">
                    <TimeAgo value={item.createdAt} showAgo={false} accurate={false} />
                    <NumberValueDisplay value={[item.lo, item.hi]} />
                  </Space>}
                />
              </div>
              <ConfirmDeleteButton onOk={() => handleDeleteItem(item)} />
            </div>
          )}
        />
        {list.length >= 6 && <div style={{ width: '100%', textAlign: 'center' }}>
          <Button block size="large" type="link" icon={<EllipsisOutlined />} />
        </div>}
      </Spin>
    </Space>
  </Container>
}

StockRangeTimelineEditor.propTypes = {
  onLoadList: PropTypes.func.isRequired,
  onSaveNew: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onSelected: PropTypes.func,
  publishedId: PropTypes.string,
  showTime: PropTypes.bool,
  mode: PropTypes.string,
  disableInput: PropTypes.bool.isRequired,
};

