import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Space, Row, Image } from 'antd';
import { withRouter } from 'react-router-dom';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';
import { StockSearchInput } from 'components/StockSearchInput';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { List } from 'antd';
import Icon from '@ant-design/icons';
import {GiRadarSweep} from 'react-icons/gi';
import {AiOutlineNotification} from 'react-icons/ai';
import { BsCalendar } from 'react-icons/bs';
import {RiTeamLine, RiLineChartLine} from 'react-icons/ri';
import {BsArrowBarDown, BsArrowBarUp} from 'react-icons/bs';
import {AiOutlineSwap} from 'react-icons/ai';

const { Text} = Typography;

const Container = styled.div`
// border-bottom: 1px solid #f0f0f0;
// background: #092b00;
// background-image: linear-gradient(160deg, #3273A4, #57BB60);
// background-image: linear-gradient(#135200, #57BB60);
// background-image: linear-gradient(-30deg, #55B0D4, #55B0D4 25%, #89DFF1 25%, #89DFF1 50%, #7DD487 50%, #7DD487 75%, #57BB60 75%, #57BB60 100%);
// background-image: linear-gradient(150deg, #ffffff, #ffffff 25%, #55B0D4 25%, #55B0D4 50%, #7DD487 50%, #7DD487 75%, #57BB60 75%, #57BB60 100%);
// background-image: linear-gradient(150deg, #ffffff, #ffffff 25%, #55B0D4 25%, #55B0D4 50%, #57BB60 50%, #57BB60 75%, #f0f0f0 75%, #f0f0f0 100%);
// background: linear-gradient(to bottom, rgba(19,82,0,0.9), rgba(9,43,0, 0.7)), url('/images/poster.jpg') center center repeat;
margin: 0 auto 0;
padding: 1rem;
width: 100%;
// height: 100%;
.signup-panel .ant-typography {
  // color: rgba(255,255,255,1) !important;
}

.ant-select-selector {
  border-radius: 40px !important;
  padding:0 20px !important;
  // height: 50px !important;

  .ant-select-selection-search {
    left: 20px;
  }
}
`;


const InnerContainer = styled.div`
margin-left: auto;
margin-right: auto;
width: 100%;
max-width: 600px;

.top-menu {
  .ant-select, .ant-btn-link {
    color: rgba(0,0,0,0.8) !important;

    .ant-select-arrow {
      color: rgba(0,0,0,0.8) !important;
    }
    &:hover {
      color: black !important;
    }
  }
}
`;




const HomeFeatureAreaRaw = props => {

  const { onSymbolClick } = props;

  const data = [
    {
      icon: <Icon component={() =><RiLineChartLine/>} />,
      description: 'EVC fair values show the rational value range',
    },
    {
      icon: <Icon component={() =><BsArrowBarDown/>} />,
      description: 'Using support levels and the scope of buy points to avoid panic selling at bottom prices',
    },
    {
      icon: <Icon component={() =><BsArrowBarUp/>} />,
      description: 'With resistance levels, sell points attain profits; buy points indicate a breakthrough trend',
    },
    {
      icon: <Icon component={() => <AiOutlineSwap />} />,
      description: 'Timely information about Executives shareholding changes',
    },
    {
      icon: <Icon component={() => <BsCalendar />} />,
      description: 'Daily option put/call ratio (PCR) traces market sentiment and direction',
    },
    {
      icon: <Icon component={() => <GiRadarSweep />} />,
      description: 'Stock Radar helps save time and improve efficiency, select valuable investing targets',
    },
    {
      icon: <Icon component={() => <AiOutlineNotification />} />,
      description: 'Email alerts for Watchlists deliver real-time data updates to your inbox, do not miss an opportunity',
    },
  ];


  return (
    <Container>
      <InnerContainer>
        <List 
        itemLayout="horizontal"
        dataSource={data}
        // bordered
        // size="small"
        renderItem={item => (
          <List.Item>
            <Space size="large">
            <Text type="success" style={{fontSize: 40}}>{item.icon}</Text>
            <Text style={{fontSize: 16, color: 'rgba(0,0,0,0.55)'}}>{item.description}</Text>
            </Space>
          </List.Item>
        )}
        />
        {/* <Paragraph style={{ textAlign: 'left' }}>
          <StyledUl>
            <li>
              EVC fair values show the rational value range.
                </li>
            <li>
              Using support levels and the scope of buy points to avoid panic selling at bottom prices.
                </li>
            <li>
              With resistance levels, sell points attain profits; buy points indicate a breakthrough trend.
                </li>
            <li>
              Timely information about Executives shareholding changes.
                </li>
            <li>
              Daily option put/call ratio (PCR) traces market sentiment and direction.
                </li>
            <li>
              Stock Radar helps save time and improve efficiency, select valuable investing targets.
                </li>
            <li>
              Email alerts for Watchlists deliver real-time data updates to your inbox, do not miss an opportunity.
                </li>
          </StyledUl>
        </Paragraph> */}
      </InnerContainer>
    </Container>
  );
}

HomeFeatureAreaRaw.propTypes = {
  onSymbolClick: PropTypes.func,
};

HomeFeatureAreaRaw.defaultProps = {
  onSymbolClick: () => { }
};

export const HomeFeatureArea = withRouter(HomeFeatureAreaRaw);

export default HomeFeatureArea;
