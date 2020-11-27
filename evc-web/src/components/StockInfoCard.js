import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Space, Row, Col, Tooltip, Modal } from 'antd';
import { withRouter } from 'react-router-dom';
import { DeleteOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { NumberRangeDisplay } from './NumberRangeDisplay';
import { TimeAgo } from 'components/TimeAgo';
import { StockName } from './StockName';

const { Paragraph, Text } = Typography;


const StockInfoCard = (props) => {

  const { value, onClick, hoverable, actions } = props;

  const [stock] = React.useState(value);

  return (
    <Card
      size="small"
      type="inner"
      // bordered={false}
      title={<StockName value={stock} />}
      onClick={props.onClick}
      hoverable={hoverable}
      actions={actions}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row>
          <Col span={12}>
            <Text type="secondary">Resistance</Text>
          </Col>
          <Col span={12}>
            <Space size="small" direction="vertical">
              <NumberRangeDisplay lo={stock.resistanceShortLo} hi={stock.resistanceShortHi} />
              <NumberRangeDisplay lo={stock.resistanceLongLo} hi={stock.resistanceLongHi} />
            </Space>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Text type="secondary">Value</Text>
          </Col>
          <Col span={12}>
            <NumberRangeDisplay lo={stock.valueLo} hi={stock.valueHi} />
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Text type="secondary">Support</Text>
          </Col>
          <Col span={12}>
            <Space size="small" direction="vertical">
            <NumberRangeDisplay lo={stock.supportShortLo} hi={stock.supportShortHi} />
            <NumberRangeDisplay lo={stock.supportLongLo} hi={stock.supportLongHi} />
            </Space>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Text type="secondary">Published</Text>
          </Col>
          <Col span={12}>
            <TimeAgo value={stock.publishedAt} accurate={true} />
          </Col>
        </Row>
      </Space>
    </Card>
  );
};

StockInfoCard.propTypes = {
  value: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  actions: PropTypes.array,
};

StockInfoCard.defaultProps = {
};

export default withRouter(StockInfoCard);
