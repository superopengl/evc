import React, { useContext } from 'react';
import styled from 'styled-components';
import { Typography, Button, Space, Row, Col, Modal, Drawer } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { useWindowWidth } from '@react-hook/window-size'
import { GlobalContext } from 'contexts/GlobalContext';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';
import { StockSearchInput } from 'components/StockSearchInput';
import { LocaleSelector } from 'components/LocaleSelector';
import { StockGuestPreviewDrawer } from 'components/StockGuestPreviewDrawer';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const { Title, Paragraph } = Typography;


const Container = styled.div`
// border-bottom: 1px solid #f0f0f0;
// background: #092b00;
background-image: linear-gradient(160deg, #3273A4, #15be53);
// background-image: linear-gradient(#135200, #15be53);
// background-image: linear-gradient(150deg, #135200, #135200 25%, #15be53 25%, #15be53 50%, #15bead 50%, #15bead 75%, #18b0d7 75%, #18b0d7 100%);
background-image: linear-gradient(-30deg, #18b0d7, #18b0d7 25%, #67ddf0 25%, #67ddf0 50%, #5dd982 50%, #5dd982 75%, #15be53 75%, #15be53 100%);
// background-image: linear-gradient(150deg, #ffffff, #ffffff 25%, #18b0d7 25%, #18b0d7 50%, #5dd982 50%, #5dd982 75%, #15be53 75%, #15be53 100%);
// background-image: linear-gradient(150deg, #ffffff, #ffffff 25%, #18b0d7 25%, #18b0d7 50%, #15be53 50%, #15be53 75%, #f0f0f0 75%, #f0f0f0 100%);
// background: linear-gradient(to bottom, rgba(19,82,0,0.9), rgba(9,43,0, 0.7)), url('/images/poster.jpg') center center repeat;
margin: 0 auto 0;
padding: 2rem;
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
`;

const HomeCarouselAreaRaw = props => {

  const {onSymbolClick} = props;

  const windowWidth = useWindowWidth();

  const catchPhraseSize = windowWidth < 576 ? 32 :
    windowWidth < 992 ? 40 :
      48;

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
    lg: 24,
    xl: 24,
    xxl: 24
  };

  return (
    <Container>
      <InnerContainer>
        <Row gutter={20} style={{ marginTop: 50 }}>
          <Col className="signup-panel" {...span} style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Title style={{ fontSize: catchPhraseSize, marginLeft: 'auto', marginRight: 'auto' }}>Easy Value Check</Title>
            <Paragraph level={3} style={{ fontSize: catchPhraseSize * 0.4, marginLeft: 'auto', marginRight: 'auto' }}>Easy Value Check provides top class invstiment guidence to earn more money on the market! Go go go! Sign up today!</Paragraph>
            <div style={{ maxWidth: 550, margin: '2rem auto' }}>
              <StockSearchInput size="large" onChange={handleSearchChange} traceSearch={true} />
            </div>
            <Space align="center" style={{ marginLeft: 'auto', marginRight: 'auto', width: '100%', justifyContent: 'center' }} >
              <SignUpButton type="primary" onClick={() => handleSignOn()}>Sign Up with Email</SignUpButton>
              <GoogleSsoButton
                render={
                  renderProps => (
                    <Button
                      type="secondary"
                      block
                      icon={<GoogleLogoSvg size={16} />}
                      // icon={<GoogleOutlined />}
                      onClick={renderProps.onClick}
                      disabled={renderProps.disabled}
                    >Continue with Google</Button>
                  )}
              />
            </Space>
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
