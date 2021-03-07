import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Space, Table, Typography } from 'antd';
import { TimeAgo } from 'components/TimeAgo';
import { withRouter } from 'react-router-dom';
import { NumberRangeDisplay } from './NumberRangeDisplay';
import { timer } from 'rxjs';
import { mergeMap, filter } from 'rxjs/operators';

const { Text, Title } = Typography;

const Container = styled.div`
`;

const StyledTable = styled(Table)`
.ant-typography {
  font-size: 0.8rem;
}

.ant-table-cell {
  background-color: white !important;
  padding-top: 2px !important;
  padding-bottom: 2px !important;
}

.ant-table-thead {
  .ant-table-cell {
    color: rgba(0,0,0,0.5);
    font-size: 0.8rem;
    text-align: right;

    &:first-child {
      text-align: left;
    }
  }
}

.even-row {
  border-bottom: none;

  .ant-table-cell {
    border-bottom: none;
    padding-bottom: 0 !important;
  }
}

.odd-row {
  .ant-table-cell {
    padding-top: 0 !important;
  }
}
`;

const CellSpace = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 100%;
  text-align: right;
`;

const columnDef = [
  {
    title: 'symbol',
    render: (text, item, index) => {
      const { symbol, company, publishedAt } = item;
      if (index % 2 === 0) {
        return <Text style={{ fontSize: '1rem', color: '#3273A4' }} strong>{symbol}</Text>;
      }
      return {
        props: {
          colSpan: 4,
        },
        children: <Space style={{width: '100%', justifyContent: 'space-between'}}>
          <Text type="secondary"><small>{company}</small></Text>
          <TimeAgo direction="horizontal" value={publishedAt} showAgo={false} prefix={<Text type="secondary"><small>published:</small></Text>} />
        </Space>
      };
    }
  },
  // {
  //   title: 'fair value',
  //   render: (value, item, index) => index % 2 ? { props: { colSpan: 0 } } : <CellSpace>
  //     <NumberRangeDisplay lo={item.fairValueLo} hi={item.fairValueHi} />
  //   </CellSpace>
  // },
  // {
  //   title: 'support',
  //   render: (value, item, index) => index % 2 ? { props: { colSpan: 0 } } : <CellSpace>
  //     <NumberRangeDisplay lo={item.supportLo} hi={item.supportHi} />
  //   </CellSpace>
  // },
  // {
  //   title: 'resistance',
  //   render: (value, item, index) => index % 2 ? { props: { colSpan: 0 } } : <CellSpace>
  //     <NumberRangeDisplay lo={item.resistanceLo} hi={item.resistanceHi} />
  //   </CellSpace>
  // },
];


const StockMostSearched = (props) => {

  const { title, onFetch } = props;

  const [list, setList] = React.useState([]);

  const pollData = () => {
    return timer(0, 15 * 1000).pipe(
      mergeMap(() => onFetch()),
      filter(data => !!data),
    ).subscribe(data => setList(data));
  }

  React.useEffect(() => {
    const subscription = pollData();
    return () => {
      subscription.unsubscribe();
    }
  }, []);

  const getFormattedList = () => {
    const data = [];
    list.forEach((item, i) => {
      data.push({ key: i * 2, ...item });
      data.push({ key: i * 2 + 1, ...item });
    })
    return data;
  }

  return (
    <Container>
      {title && <Title level={5}>{title}</Title>}
      <StyledTable
        dataSource={getFormattedList()}
        columns={columnDef}
        rowKey="key"
        pagination={false}
        rowClassName={(item, index) => {
          return index % 2 === 1 ? 'odd-row' : 'even-row';
        }}
        size="small"
      />
    </Container>
  )

};

StockMostSearched.propTypes = {
  title: PropTypes.string,
  onFetch: PropTypes.func.isRequired,
};

StockMostSearched.defaultProps = {
};

export default withRouter(StockMostSearched);
