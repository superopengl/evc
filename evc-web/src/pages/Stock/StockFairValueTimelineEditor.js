
import React from 'react';
import { List, Typography, Space, Alert, Table } from 'antd';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import { PushpinFilled, PushpinOutlined, EllipsisOutlined, DeleteOutlined, FlagFilled, FlagOutlined } from '@ant-design/icons';
import * as _ from 'lodash';
import { NumberRangeInput } from 'components/NumberRangeInput';
import { NumberRangeDisplay } from 'components/NumberRangeDisplay';
import { AiTwotonePushpin } from 'react-icons/ai';
import styled from 'styled-components';
import { Switch } from 'antd';
import { Tag } from 'antd';
import { ConfirmDeleteButton } from './ConfirmDeleteButton';
import { TimeAgo } from 'components/TimeAgo';

const { Text } = Typography;

const Container = styled.div`
  .current-published {
    background-color: rgba(21,190,83, 0.1);
  }
`;


export const StockFairValueTimelineEditor = (props) => {
  const { onLoadList, onSaveNew, onChange, onDelete, onSelected, getClassNameOnSelect, showTime, sourceEps, sourcePe } = props;
  const [disabled, setDisabled] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);
  const [isSpecialFairValue, setIsSpecialFairValue] = React.useState(false);
  const [derivedValue, setDerivedValue] = React.useState({ lo: null, hi: null });

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
    loadEntity();
  }, []);


  React.useEffect(() => {
    const enabled = sourceEps?.length >= 4 && sourcePe.length > 0;
    setDisabled(!enabled);
    if (enabled) {
      const sum = _.sum(sourceEps.slice(0, 4).map(x => x.value));
      const targetPe = sourcePe[0];
      setDerivedValue({
        lo: _.isNumber(targetPe.lo) ? targetPe.lo * sum : null,
        hi: _.isNumber(targetPe.hi) ? targetPe.hi * sum : null
      });
    }
  }, [sourceEps, sourcePe])

  const handleSave = async (range) => {
    try {
      setLoading(true);
      await onSaveNew({
        lo: range[0],
        hi: range[1],
        special: isSpecialFairValue,
        epsIds: sourceEps.slice(0, 4).map(x => x.id),
        peId: sourcePe[0].id,
      });
      setIsSpecialFairValue(false);
      updateList(await onLoadList());
    } finally {
      setLoading(false);
    }
  }


  const handleSpecialFairSwitchChange = checked => {
    setIsSpecialFairValue(checked);
  }

  const handleDeleteSpecialFairValue = async (specialFairValueId) => {
    try {
      setLoading(true);
      await onDelete(specialFairValueId);
      updateList(await onLoadList());
    } finally {
      setLoading(false);
    }
  }

  const displayNumber = value => {
    return _.isNil(value) ? <Text type="danger"><small>n/a</small></Text> : (+value).toFixed(2);
  }

  const columnDef = [
    {
      title: 'Date',
      dataIndex: 'date',
      render: (value) => <TimeAgo value={value} showTime={false} showAgo={false} direction="horizontal" />
    },
    {
      title: 'PE',
      dataIndex: 'pe',
      render: displayNumber
    },
    {
      title: 'PE (lo)',
      dataIndex: 'peLo',
      render: displayNumber
    },
    {
      title: 'PE (hi)',
      dataIndex: 'peHi',
      render: displayNumber
    },
    {
      title: 'FV (lo)',
      dataIndex: 'fairValueLo',
      render: displayNumber
    },
    {
      title: 'FV (hi)',
      dataIndex: 'fairValueHi',
      render: displayNumber
    },
    {
      dataIndex: 'id',
      render: (value) => value ? <Tag color="gold">special</Tag> : <Tag color="blue">computed</Tag>
    },
    {
      render: (value, item) => {
        const { id } = item;
        if (!id) return;
        return <ConfirmDeleteButton onOk={() => handleDeleteSpecialFairValue(id)} />
      }
    }
  ];

  return <Container>
    <Space size="small" direction="vertical" style={{ width: '100%' }}>
      <Space direction="vertical" size="middle">
        {disabled && <Alert type="warning" message="Please setup EPS and EP before setting up Fair Value" showIcon />}
        <Space>
          <Text>Special Fair Value</Text>
          <Switch checked={isSpecialFairValue} onChange={handleSpecialFairSwitchChange} disabled={loading || disabled} />
        </Space>
        <NumberRangeInput
          onSave={handleSave}
          value={[derivedValue?.lo, derivedValue?.hi]}
          disabled={loading || disabled}
          readOnly={!isSpecialFairValue}
          allowInputNone={true}
        />
      </Space>
      <Table
        columns={columnDef}
        dataSource={list}
        size="small"
        rowKey={item => item.id ?? item.date}
        loading={loading}
        pagination={false}
        style={{ width: '100%' }}
      />
    </Space>
  </Container>
}

StockFairValueTimelineEditor.propTypes = {
  onLoadList: PropTypes.func.isRequired,
  onSaveNew: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
  onSelected: PropTypes.func,
  getClassNameOnSelect: PropTypes.func,
  showTime: PropTypes.bool,
  sourceEps: PropTypes.array.isRequired,
  sourcePe: PropTypes.array.isRequired,
};

StockFairValueTimelineEditor.defaultProps = {
  showTime: true,
  onChange: () => { },
  onDelete: () => { },
  onSelected: () => { },
  getClassNameOnSelect: () => false,
};
