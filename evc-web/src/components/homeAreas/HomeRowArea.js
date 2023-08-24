import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Row, Col } from 'antd';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  color: '#383838';
`;

const Container = styled.div`
justify-content: center;
margin-bottom: 0rem;
width: 100%;
text-align: center;
padding: 2rem 0;

& .react-multi-carousel-list {
  padding: 12px;
}
`;

const InnerContainer = styled.div`
margin-left: auto;
margin-right: auto;
width: 100%;
max-width: 1600px;
`;

const StyledRow = styled(Row)`
padding: 0 1rem;
`;

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 6
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 4
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 3
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1
  }
};

export const HomeRowArea = props => {


  const { title, style, bgColor, children, deviceType } = props;
  const [collapsed, setCollapsed] = React.useState(true);

  const toggle = (value) => {
    setCollapsed(value);
  }

  const renderChildComponent = (comp) => {
    const { span } = props;
    return <Col {...span}>
      {comp}
    </Col>
  }


  return (
    <Container style={{ backgroundColor: bgColor || '#fff', ...style }} >
      <InnerContainer>
        <Row>
          <Col span={24}>
            {title && <Title>{title}</Title>}
          </Col>

        </Row>

        <StyledRow gutter={12}>

          {React.Children.map(children, renderChildComponent)}
        </StyledRow>


        {false && <Carousel
          responsive={responsive}
          swipeable={true}
          removeArrowOnDeviceType={["tablet", "mobile"]}
          deviceType={deviceType}
        >
          {children}
        </Carousel>}
      </InnerContainer>
    </Container>

  );
}

HomeRowArea.propTypes = {
  title: PropTypes.string,
  bgColor: PropTypes.string,
  span: PropTypes.shape({
    xs: PropTypes.number,
    sm: PropTypes.number,
    md: PropTypes.number,
    lg: PropTypes.number,
    xl: PropTypes.number,
    xxl: PropTypes.number
  })
};

HomeRowArea.defaultProps = {
  span: {
    xs: 12,
    sm: 12,
    md: 6,
    lg: 6,
    xl: 4,
    xxl: 4,
  }
};

export default HomeRowArea;
