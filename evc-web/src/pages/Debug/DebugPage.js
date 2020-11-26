import React from 'react';
import styled from 'styled-components';
import { Typography, Layout } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { withRouter } from 'react-router-dom';
import { getDebugInfo } from 'services/debugService';
import { Loading } from 'components/Loading';

const { Paragraph } = Typography;

const ContainerStyled = styled.div`
margin: 5rem auto 2rem auto;
padding: 0 1rem;
width: 100%;
max-width: 400px;
`;


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;


const DebugPage = props => {
  const [loading, setLoading] = React.useState(true);
  const [ info, setInfo ]= React.useState();

  const loadEntity = async () => {
    try {
      setLoading(true);
      const info = await getDebugInfo();
      setInfo(info);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadEntity();
  }, []);

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Loading loading={loading}>
          <Paragraph code>
            {JSON.stringify(info, null, 2)}
          </Paragraph>
        </Loading>
      </ContainerStyled>
    </LayoutStyled >
  );
};

DebugPage.propTypes = {};

DebugPage.defaultProps = {};

export default withRouter(DebugPage);
