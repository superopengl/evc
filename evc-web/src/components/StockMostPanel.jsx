import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Table, Typography } from 'antd';
import NumberAmount from 'components/NumberAmount';
import { withRouter } from 'util/withRouter';
import { FormattedMessage } from 'react-intl';

const { Text, Title, Link: TextLink } = Typography;

/**
 * Two <tr>s make one row of data (symbol + prices, then the company name underneath), which
 * is why the even/odd classes exist: they collapse the padding between the pair and drop the
 * divider that would otherwise split a single logical row in half.
 */
const StyledTable = styled(Table)`
/* Transparent rather than the old hard white: the board behind it is white already, and
   the !important is what keeps antd's row-hover tint from highlighting one half of a pair. */
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

const StockMostPanel = (props) => {
  const columnDef = [
    {
      title: 'symbol',
      render: (text, item, index) => {
        const { symbol, company } = item;
        if (index % 2 === 0) {
          return <StyledSymbolTextLink onClick={() => onSymbolClick(symbol)}>{symbol}</StyledSymbolTextLink>;
        }
        return {
          children: <CompanyName>{company || symbol}</CompanyName>,
          props: {
            colSpan: 4,
          },
        };
      }
    },
    {
      title: 'last price',
      dataIndex: 'latestPrice',
      render: (value, record, index) => index % 2 ? { props: { colSpan: 0 } } : <div className="evc-mono" style={{ width: '100%', textAlign: 'right' }}><Text>{value?.toFixed(2)}</Text></div>
    },
    {
      title: 'change',
      dataIndex: 'change',
      render: (value, record, index) => index % 2 ? { props: { colSpan: 0 } } : <div className="evc-mono" style={{ width: '100%', textAlign: 'right' }}><NumberAmount value={value} /></div>
    },
    {
      title: '% change',
      dataIndex: 'changePercent',
      render: (value, record, index) => index % 2 ? { props: { colSpan: 0 } } : <div className="evc-mono" style={{ width: '100%', textAlign: 'right' }}><NumberAmount postfix="%" digital={2} value={value * 100} /></div>
    },
  ];

  // `value = []` as a destructuring default is a re-render loop: the effect below keys off
  // `value`, and a fresh [] literal is a new identity on every render, so setList schedules
  // another render forever while the fetch is still in flight. Default inside the effect.
  const { title, value, titleDot, titleStyle, loading = true, onSymbolClick = () => { } } = props;

  const [list, setList] = React.useState([]);

  React.useEffect(() => {
    const dataList = [];
    (value || []).forEach((item, i) => {
      dataList.push({ key: i * 2, ...item });
      dataList.push({ key: i * 2 + 1, ...item });
    })

    setList(dataList);
  }, [value]);

  return (
    <>
      {title && <Title level={5} style={{ ...titleStyle }} strong>
        {titleDot && <span style={titleDot} />}{title}
      </Title>}
      <StyledTable
        dataSource={list}
        loading={loading}
        columns={columnDef}
        rowKey="key"
        pagination={false}
        rowClassName={(item, index) => {
          return index % 2 === 1 ? 'odd-row' : 'even-row';
        }}
        size="small"
        locale={{
          emptyText: <div style={{ maxWidth: 240, textAlign: 'center', margin: '28px auto', fontSize: 12.5, lineHeight: 1.6, color: 'var(--evc-text-faint)' }}>
            <FormattedMessage id="text.mostEmpty" />
          </div>
        }}
      />
    </>
  )

};

StockMostPanel.propTypes = {
  title: PropTypes.string,
  titleDot: PropTypes.object,
  titleStyle: PropTypes.any,
  value: PropTypes.array,
  loading: PropTypes.bool,
  onSymbolClick: PropTypes.func
};

export default withRouter(StockMostPanel);
