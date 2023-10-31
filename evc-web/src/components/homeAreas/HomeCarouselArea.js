import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Space, Row, Col, List } from 'antd';
import { withRouter } from 'react-router-dom';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';
import { SearchStockInput } from 'components/SearchStockInput';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Image } from 'antd';

import Icon from '@ant-design/icons';
import { GiRadarSweep } from 'react-icons/gi';
import { AiOutlineNotification } from 'react-icons/ai';
import { BsCalendar } from 'react-icons/bs';
import { RiLineChartLine } from 'react-icons/ri';
import { BsArrowBarDown, BsArrowBarUp } from 'react-icons/bs';
import { AiOutlineSwap } from 'react-icons/ai';


const { Text, Title, Paragraph } = Typography;

const Container = styled.div`
// border-bottom: 1px solid #f0f0f0;
// background: #092b00;
// background-image: linear-gradient(160deg, #3273A4, #57BB60);
// background-image: linear-gradient(#135200, #57BB60);
background-image: linear-gradient(-45deg, #89DFF1, #89DFF1 25%, #55B0D4 25%, #55B0D4 50%, #7DD487 50%, #7DD487 75%, #57BB60 75%, #57BB60 100%);
// background-image: linear-gradient(-45deg, #55B0D4, #55B0D4 50%, #57BB60 50%, #57BB60 100%);
// background-image: linear-gradient(150deg, #ffffff, #ffffff 25%, #55B0D4 25%, #55B0D4 50%, #7DD487 50%, #7DD487 75%, #57BB60 75%, #57BB60 100%);
// background-image: linear-gradient(150deg, #ffffff, #ffffff 25%, #55B0D4 25%, #55B0D4 50%, #57BB60 50%, #57BB60 75%, #f0f0f0 75%, #f0f0f0 100%);
// background: linear-gradient(to bottom, rgba(19,82,0,0.9), rgba(9,43,0, 0.7)), url('/images/poster.jpg') center center repeat;
margin: 0 auto 0;
padding: 1rem 1rem 4rem;
width: 100%;
// height: 100%;
.signup-panel .ant-typography {
  // color: rgba(255,255,255,1) !important;
}

.ant-select-selector {
  // border-radius: 40px !important;
  padding:0 20px !important;
  // height: 50px !important;
  background-color: rgba(255,255,255,0.8) !important;

  .ant-select-selection-search {
    left: 20px;
  }
}
`;

const StyledList = styled(List)`
font-size: 14px;
max-width: 500px;
margin-left: auto;
margin-right: auto;


.ant-list-item {
  border: none;
  padding: 8px 0;
}
`;

const InnerContainer = styled.div`
margin-left: auto;
margin-right: auto;
width: 100%;
max-width: 1200px;

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



const SignUpButton = styled(Button)`
// background-color: white !important;
width: 195px;
`;

const StyledGoogleButton = styled(Button)`
background-color: rgba(255,255,255,0.8) !important;

`;

const HomeCarouselAreaRaw = props => {

  const { onSymbolClick } = props;

  const handleSignOn = () => {
    props.history.push('/signup')
  }

  const handleSearchChange = symbol => {
    if (symbol) {
      onSymbolClick(symbol);
    }
  }

  const span = {
    xs: 24,
    sm: 24,
    md: 24,
    lg: 12,
    xl: 12,
    xxl: 12
  };

  const data = [
    {
      icon: <Icon component={() => <RiLineChartLine />} />,
      description: <FormattedMessage id="text.slogan1" />,
    },
    {
      icon: <Icon component={() => <BsArrowBarUp />} />,
      description: <FormattedMessage id="text.slogan2" />,
    },
    {
      icon: <Icon component={() => <AiOutlineSwap />} />,
      description: <FormattedMessage id="text.slogan4" />,
    },
    {
      icon: <Icon component={() => <BsCalendar />} />,
      description: <FormattedMessage id="text.slogan5" />,
    },
    {
      icon: <Icon component={() => <GiRadarSweep />} />,
      description: <FormattedMessage id="text.slogan6" />,
    },
    {
      icon: <Icon component={() => <AiOutlineNotification />} />,
      description: <FormattedMessage id="text.slogan7" />,
    },
  ];


  return (
    <Container>
      <InnerContainer>
        <Row gutter={[30, 30]} style={{ marginTop: 70, marginBottom: 10, alignItems: 'center' }}>
          <Col className="signup-panel" {...span} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* <Image src="/images/logo-transparent.png" width={120} style={{marginBottom: 20}} preview={false}/> */}
            <Image src="/images/logo-transparent.png" style={{ width: 140 }} preview={false} />
            <Title style={{ fontSize: 'clamp(22px, 3vw, 28px)', color: 'rgba(0,0,0,0.8)', marginTop: 24, marginBottom: 0, fontWeight: 'bolder' }}>EASY VALUE CHECK</Title>
            <Paragraph level={3} style={{ fontSize: 'clamp(14px, 5vw, 18px)', color: 'rgba(0,0,0,0.8)' }} strong>
              <FormattedMessage id="home.catchPhrase" />
            </Paragraph>

            <div style={{ maxWidth: 400, width: '100%', margin: '10px 0 30px' }}>
              <SearchStockInput size="large" onChange={handleSearchChange} traceSearch={true} />
            </div>
            <Row gutter={[10, 10]}>
              <Col flex="auto">
                <SignUpButton type="primary" onClick={() => handleSignOn()}>
                  <FormattedMessage id="button.signUpWithEmail" />
                </SignUpButton>
              </Col>
              <Col flex="auto">
                <GoogleSsoButton
                  render={
                    renderProps => (
                      <StyledGoogleButton
                        type="secondary"
                        block
                        icon={<GoogleLogoSvg size={16} />}
                        // icon={<GoogleOutlined />}
                        style={{ width: 195 }}
                        onClick={renderProps.onClick}
                        disabled={renderProps.disabled}
                      >
                        <FormattedMessage id="button.continueWithGoogle" />
                      </StyledGoogleButton>
                    )}
                />
              </Col>
            </Row>
          </Col>
          <Col {...span}>
            <StyledList
              itemLayout="horizontal"
              dataSource={data}
              // bordered
              size="large"
              renderItem={item => (
                <List.Item>
                  <Space size="large">
                    <Text style={{ fontSize: 30, color: 'rgba(255,255,255,0.9)' }}>{item.icon}</Text>
                    <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{item.description}</Text>
                  </Space>
                </List.Item>
              )}
            />

          </Col>
        </Row>
      </InnerContainer>
    </Container>
  );
}

HomeCarouselAreaRaw.propTypes = {
  onSymbolClick: PropTypes.func,
};

HomeCarouselAreaRaw.defaultProps = {
  onSymbolClick: () => { }
};

export const HomeCarouselArea = withRouter(HomeCarouselAreaRaw);

export default HomeCarouselArea;
