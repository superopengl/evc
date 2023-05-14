// import 'App.css';
import { Affix, Button, Layout, Modal } from 'antd';
import { HashAnchorPlaceholder } from 'components/HashAnchorPlaceholder';
import HomeCarouselArea from 'components/homeAreas/HomeCarouselArea';
import HomeContactArea from 'components/homeAreas/HomeContactArea';
import HomeServiceArea from 'components/homeAreas/HomeServiceArea';
import HomeSearchArea from 'components/homeAreas/HomeSearchArea';
import HomeTeamArea from 'components/homeAreas/HomeTeamArea';
import HomeFooter from 'components/HomeFooter';
import HomeHeader from 'components/HomeHeader';
import React from 'react';
import { AiOutlineMessage } from "react-icons/ai";
import styled from 'styled-components';

const { Content } = Layout;

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
`;

const ContentStyled = styled(Content)`
  margin: 64px auto 0 auto;
  width: 100%;
`;


class HomePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false
    }

    this.contactFormRef = React.createRef();

  }

  openContactForm = () => {
    this.setState({
      modalVisible: true
    });
  }

  handleContactCancel = () => {
    this.setState({
      modalVisible: false
    }, () => this.resetContactForm());
  }

  resetContactForm = () => {
    this.contactFormRef.current.reset();
  }


  render() {

    return (
      <LayoutStyled>
        <HomeHeader></HomeHeader>
        {/* <BarStyled></BarStyled> */}
        <ContentStyled>
          <HashAnchorPlaceholder id="home" />
          <section>
            <HomeCarouselArea></HomeCarouselArea>
          </section>
          {/* <section><HomeSearchArea /></section> */}
          <HashAnchorPlaceholder id="services" />
          <section><HomeServiceArea bgColor="#135200"/></section>
          {/* <HashAnchorPlaceholder id="team" /> */}
          {/* <section><HomeTeamArea /></section> */}
          {/* <section><HomeContactArea bgColor="#135200"></HomeContactArea></section> */}
        </ContentStyled>
        <HomeFooter style={{position: 'fixed', bottom: 0}}></HomeFooter>
      </LayoutStyled>
    );
  }
}

HomePage.propTypes = {};

HomePage.defaultProps = {};

export default HomePage;
