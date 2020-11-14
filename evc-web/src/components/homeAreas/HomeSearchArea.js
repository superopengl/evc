import React, { useContext } from 'react';
import styled from 'styled-components';
import { Typography, Button, Space, Row, Col, Input } from 'antd';
import { withRouter } from 'react-router-dom';
import { useWindowWidth } from '@react-hook/window-size'
import { GlobalContext } from 'contexts/GlobalContext';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';

const { Title } = Typography;


const ContainerStyled = styled.div`
border-bottom: 1px solid #f0f0f0;
margin: 0 auto 0 auto;
// padding: 1rem;
width: 100%;
`;

const SignInButton = styled(Button)`
// margin-top: 1rem;
max-width: 300px;
// height: 50px;
// border-radius: 30px;
// font-size: 1.3rem;
// border: 2px solid white;
`;


const PosterContainer = styled.div`
width: 100%;
// min-height: 200px;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
padding: 1rem;
// padding-top: 40px;

// .ant-typography {
//   color: rgba(255,255,255,1) !important;
//   text-align: center;
// }

`;

const span = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 12,
  xl: 12,
  xxl: 12
}

const HomeSearchAreaRaw = props => {

  const windowWidth = useWindowWidth();
  const context = useContext(GlobalContext);

  const handleSignIn = () => {
    props.history.push('/signup')
  }

  const handleSearch = async value => {

  }


  return (
    <ContainerStyled gutter={0} style={{ position: 'relative' }}>
      <PosterContainer style={{ position: 'relative' }}>
              <Input.Search
                size="large"
                placeholder="Input stock code"
                allowClear
                onSearch={handleSearch}
                style={{width: '100%', maxWidth: 500}}
              />
      </PosterContainer>
    </ContainerStyled>
  );
}

HomeSearchAreaRaw.propTypes = {};

HomeSearchAreaRaw.defaultProps = {};

export const HomeSearchArea = withRouter(HomeSearchAreaRaw);

export default HomeSearchArea;
