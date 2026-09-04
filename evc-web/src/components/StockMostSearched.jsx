import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Space, Table, Typography } from 'antd';
import { TimeAgo } from 'components/TimeAgo';
import { withRouter } from 'util/withRouter';
import { timer } from 'rxjs';
import { mergeMap, filter } from 'rxjs/operators';

const { Text, Title, Link: TextLink } = Typography;

const Container = styled.div`
`;

/**
 * Kept in step with StockMostPanel: the two boards sit side by side, so the header rule,
 * row rhythm and symbol treatment have to match exactly or the pair reads as misaligned.
 */
const StyledTable = styled(Table)`
.ant-table-cell {
  background-color: transparent !important;
}

.ant-typography {
  font-size: 12.5px;
}

.ant-table-thead {
  .ant-table-cell {
    color: var(--evc-text-faint);
    font-family: var(--evc-font-mono);
    font-size: 9.5px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-align: right;
    white-space: nowrap;
    padding-inline: 10px 0 !important;
    padding-block: 0 8px !important;
    border-bottom: 1px solid var(--evc-line) !important;

    &::before {
      display: none !important;
    }

    &:first-child {
      text-align: left;
      padding-inline-start: 0 !important;
    }
  }
}

.ant-table-tbody {
  .ant-table-cell {
    padding-inline: 10px 0 !important;
    border-bottom-color: var(--evc-line-soft) !important;
  }

  /* Four boards sit side by side from xl up, so each numeric column is only ~60px wide.
     Without this a +200.00 % breaks onto a second line and knocks the pair of rows out
     of alignment with the board next to it. */
  .ant-table-cell .evc-mono {
    white-space: nowrap;
  }
}

.ant-table-tbody .ant-table-cell:first-child {
  padding-inline-start: 0 !important;
}

.even-row {
  border-bottom: none;

  .ant-table-cell {
    border-bottom: none;
    padding-bottom: 0 !important;
    padding-top: 11px !important;
  }
}

.odd-row {
  .ant-table-cell {
    padding-top: 1px !important;
    padding-bottom: 11px !important;
  }
}
`;

const StyledSymbolTextLink = styled(TextLink)`
&.ant-typography {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--evc-text);

  &:hover {
    color: var(--evc-signal-deep);
    text-decoration: underline;
  }
}
`;

const CompanyName = styled(Text)`
&.ant-typography {
  font-size: 11.5px;
  color: var(--evc-text-faint);
}
`;

const StockMostSearched = (props) => {

  const columnDef = [
    {
      title: 'symbol',
      render: (text, item, index) => {
        const { symbol, company, publishedAt } = item;
        if (index % 2 === 0) {
          return <StyledSymbolTextLink onClick={() => onSymbolClick(symbol)}>{symbol}</StyledSymbolTextLink>;
        }
        return {
          props: {
            colSpan: 4,
          },
          children: <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <CompanyName>{company}</CompanyName>
            <TimeAgo direction="horizontal" value={publishedAt} showAgo={false} prefix={<CompanyName><small>published:</small></CompanyName>} />
          </Space>
        };
      }
    },
  ];

  const { title, titleDot, titleStyle, onFetch, onSymbolClick } = props;

  const [list, setList] = React.useState([]);

  const pollData = () => {
    return timer(0, 5 * 60 * 1000).pipe(
      mergeMap(() => onFetch()),
      filter(data => !!data),
    ).subscribe(data => setList(data));
  }

  React.useEffect(() => {
    const poll$ = pollData();
    return () => {
      poll$.unsubscribe();
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
      {title && <Title level={5} style={{ ...titleStyle }} strong>
        {titleDot && <span style={titleDot} />}{title}
      </Title>}
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
  titleDot: PropTypes.object,
  titleStyle: PropTypes.any,
  onFetch: PropTypes.func.isRequired,
};

export default withRouter(StockMostSearched);
