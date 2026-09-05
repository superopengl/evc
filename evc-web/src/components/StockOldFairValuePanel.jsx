import React from 'react';
import PropTypes from 'prop-types';
import { Listy, Typography, Space, Image, Empty, Spin } from 'antd';
import { withRouter } from 'util/withRouter';
import { IconContext } from "react-icons";
import { getStockNews } from 'services/stockService';
import { TimeAgo } from 'components/TimeAgo';
import { ListyItemMeta } from 'components/ListyItemMeta';
import styled from 'styled-components';
import { MdOpenInNew } from 'react-icons/md';
import { from } from 'rxjs';

const { Title } = Typography;

const Container = styled(Space)`
width: 100%;
`;
// Was `.ant-list-item { border: none }` on the container above. Listy owns the item element,
// so it moves to styles.item - including the horizontal padding, which antd List left at 0.
const NEWS_ITEM_STYLE = { padding: '12px 0', border: 'none' };

const NewsImage = styled(Image)`
width: 200px;
border: 1px solid #f0f0f0;
padding: 4px;
border-radius: 6px;
cursor: pointer;
`;

// List -> Listy: Listy owns the item element, so this hover rule moves onto a wrapper
// rendered inside itemRender.
const StyledListItem = styled.div`
&:hover {
  .news-title {
    color: #3273A4;
    text-decoration: underline;
  }
}
`;

const StockOldFairValuePanel = (props) => {

  const { symbol } = props;
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const news = await getStockNews(symbol);
      setData(news);
      setLoading(false);
      
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const load$ = from(loadData()).subscribe();

    return () => {
      load$.unsubscribe();
    }
  }, []);

  const handleOpenNews = (url) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  }

  return (
    <Container orientation="vertical">
      <Spin spinning={loading}>
      {!loading && !data?.length && <Empty description="No news" />}
      <Listy
        items={data}
        rowKey="url"
        styles={{ item: NEWS_ITEM_STYLE }}
        itemRender={item => (
          <StyledListItem>
            <ListyItemMeta
              avatar={item.image ? <NewsImage preview={false} src={item.image} onClick={() => handleOpenNews(item.url)} /> : null}
              title={<>
                <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ width: '100%' }}>
                  <TimeAgo value={item.datetime} showAgo={false} direction="horizontal" />
                  <Space size="small" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Title level={4} style={{ margin: 0 }} className="news-title">
                      {item.headline}
                    </Title>
                    <div style={{ position: 'relative', top: 4 }}>
                      <IconContext.Provider value={{ color: '#3273A4', size: 20 }}><MdOpenInNew /></IconContext.Provider>
                    </div>
                  </Space>
                </a>
              </>
              }
              description={item.summary}
            />
          </StyledListItem>
        )}
      />
      </Spin>
    </Container>
  );
};

StockOldFairValuePanel.propTypes = {
  symbol: PropTypes.string.isRequired
};

export default withRouter(StockOldFairValuePanel);
