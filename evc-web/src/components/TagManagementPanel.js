import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table, Input, Switch, InputNumber, Typography } from 'antd';
import {
  PlusOutlined
} from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import { Space } from 'antd';
import { ConfirmDeleteButton } from 'pages/Stock/ConfirmDeleteButton';
import { from } from 'rxjs';

const { Text } = Typography;

const NEW_TAG_ITEM = Object.freeze({
  isNew: true,
  name: '',
});

const TagManagementPanel = (props) => {
  const { onList, onSave, onDelete, showOfficialOnly, showIncludesOptionPutCall } = props;

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([{ ...NEW_TAG_ITEM }]);

  const columnDef = [
    {
      title: 'Tag name',
      dataIndex: 'name',
      sorter: {
        compare: (a, b) => (a.name || '').localeCompare(b.name)
      },
      render: (value, item) => <Input
        value={value}
        allowClear={item.isNew}
        placeholder={item.isNew ? 'New tag name' : 'Tag name'}
        onChange={e => handleInputChange(item, e.target.value)}
        onBlur={e => handleInputBlur(item, e.target.value)}
      />
    },
    {
      title: 'Sort group',
      dataIndex: 'sortGroup',
      sorter: {
        compare: (a, b) => a - b
      },
      render: (value, item) => <InputNumber
        value={value}
        placeholder="To control tags' display order and group"
        onChange={num => handleSortGroupChange(item, num)}
        onBlur={e => handleSortGroupBlur(item, e.target.value)}
      />
    },
    showOfficialOnly ? {
      title: 'Official use only',
      dataIndex: 'officialOnly',
      render: (value, item) => <Switch
        defaultChecked={value}
        onChange={(checked) => handleOfficialUseChange(item, checked)}
      />
    } : null,
    showIncludesOptionPutCall ? {
      title: 'Option put/call',
      dataIndex: 'includesOptionPutCall',
      render: (value, item) => <Switch
        defaultChecked={value}
        onChange={(checked) => handleIncludeOptionPutCallChange(item, checked)}
      />
    } : null,
    {
      render: (text, item) => <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
        {item.isNew && <Button type="primary" icon={<PlusOutlined />} disabled={!isItemValid(item)} onClick={() => handleSaveNew(item)}></Button>}
        {item.builtIn ? <Text type="secondary"><small>builtin</small></Text> : item.isNew ? null : <ConfirmDeleteButton shape="circle" onOk={() => handleDelete(item)} />}
      </Space>
    },
  ].filter(x => !!x);

  const isItemValid = (item) => {
    return !!item.name?.trim();
  }

  const handleInputChange = (item, value) => {
    item.name = value;
    setList([...list]);
  }

  const handleInputBlur = async (item, value) => {
    if (item.isNew) return;
    item.name = value;
    await onSave(item);
  }

  const handleSortGroupChange = (item, value) => {
    item.sortGroup = value;
    setList([...list]);
  }

  const handleSortGroupBlur = async (item, value) => {
    item.sortGroup = value;
    if (!item.isNew) {
      await onSave(item);
    }
  }

  const handleDelete = async (item) => {
    await onDelete(item.id);
    await loadList();
  }

  const handleOfficialUseChange = async (item, checked) => {
    item.officialOnly = checked;
    if (item.isNew) return;
    await onSave(item);
  }

  const handleIncludeOptionPutCallChange = async (item, checked) => {
    item.includesOptionPutCall = checked;
    if (item.isNew) return;
    await onSave(item);
  }


  const loadList = async () => {
    try {
      setLoading(true);
      const data = await onList();
      data.unshift({ ...NEW_TAG_ITEM });
      setList(data);
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


  const handleSaveNew = async (item) => {
    if (!isItemValid(item)) return;
    try {
      setLoading(true);
      await onSave(item);
      await loadList();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Table columns={columnDef}
      showHeader={true}
      dataSource={list}
      size="small"
      rowKey="id"
      loading={loading}
      pagination={false}
    />
  );
};

TagManagementPanel.propTypes = {
  onList: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  showOfficialOnly: PropTypes.bool,
  showIncludesOptionPutCall: PropTypes.bool,
};

TagManagementPanel.defaultProps = {
  showOfficialOnly: false,
  showIncludesOptionPutCall: false,
};

export default withRouter(TagManagementPanel);
