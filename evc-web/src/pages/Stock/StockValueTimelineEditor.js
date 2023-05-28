
import React from 'react';
import { List, Typography, Space, Alert, Modal } from 'antd';
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

const { Text } = Typography;

const Container = styled.div`
  .current-published {
    background-color: rgba(21,190,83, 0.1);
  }
`;


export const StockValueTimelineEditor = (props) => {
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
    <Space size="small" direction="vertical" style={{ width: '100%' }}>
      <Space direction="vertical" size="middle">
        {disabled && <Alert type="warning" message="Please setup EPS and EP before setting up Fair Value" showIcon/>}
        <Space>
          <Text>Special Fair Value</Text>
          <Switch checked={isSpecialFairValue} onChange={handleSpecialFairSwitchChange} disabled={loading || disabled}/>
        </Space>
        <NumberRangeInput
          onSave={handleSave}
          value={[derivedValue?.lo, derivedValue?.hi]}
          disabled={loading || disabled}
          readOnly={!isSpecialFairValue}
          allowInputNone={true}
        />
      </Space>
      <List
        dataSource={list}
        loading={loading}
        itemLayout="horizontal"
        rowKey="id"
        size="small"
        locale={{ emptyText: ' ' }}
        renderItem={item => (
          <List.Item
            onClick={() => onSelected(item)}
            style={{ position: 'relative' }}
            className={getClassNameOnSelect(item)}
            extra={<ConfirmDeleteButton onOk={() => handleDeleteItem(item)} />}
          >
            <List.Item.Meta
              description={<NumberRangeDisplay value={item} showTime={showTime} />}
            />
            {item.special ? <Tag color="gold">special</Tag> : <Tag color="blue">computed</Tag>}
          </List.Item>
        )}
      />
    </Space>
  </Container>
}

StockValueTimelineEditor.propTypes = {
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

StockValueTimelineEditor.defaultProps = {
  showTime: true,
  onChange: () => { },
  onDelete: () => { },
  onSelected: () => { },
  getClassNameOnSelect: () => false,
};
