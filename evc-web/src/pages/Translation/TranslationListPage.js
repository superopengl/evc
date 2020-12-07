import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Button, Table, Input, Modal, Form, Tooltip, Tag, Drawer, Divider } from 'antd';
import HomeHeader from 'components/HomeHeader';
import {
  DeleteOutlined, SafetyCertificateOutlined, UserAddOutlined, GoogleOutlined, SyncOutlined, QuestionOutlined,
  IdcardOutlined, SearchOutlined,
  UserOutlined
} from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import { Space, Alert } from 'antd';
import { listAllUsers, deleteUser, setPasswordForUser } from 'services/userService';
import { inviteUser, impersonate } from 'services/authService';
import { TimeAgo } from 'components/TimeAgo';
import { FaTheaterMasks } from 'react-icons/fa';
import { reactLocalStorage } from 'reactjs-localstorage';
import { GlobalContext } from 'contexts/GlobalContext';
import PortfolioList from 'pages/Portfolio/PortfolioList';
import ProfileForm from 'pages/Profile/ProfileForm';
import { BiDollar } from 'react-icons/bi';
import ReferralBalanceForm from 'components/ReferralBalanceForm';
import * as _ from 'lodash';
import { subscriptionDef } from 'def/subscriptionDef';
import Highlighter from "react-highlight-words";
import HighlightingText from 'components/HighlightingText';
import CheckboxButton from 'components/CheckboxButton';
import { flushTranslation, listAllTranslationsForEdit, saveTranslation } from 'services/translationService';
import { notify } from 'util/notify';

const { Title, Text, Paragraph } = Typography;

const ContainerStyled = styled.div`
  margin: 6rem 1rem 2rem 1rem;
`;

const StyledTitleRow = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 width: 100%;
`

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;

const subscriptionDefMap = _.keyBy(subscriptionDef, 'key');

const DEFAULT_QUERY_INFO = {
  text: '',
  page: 1,
  size: 50,
  subscription: [],
  orderField: 'createdAt',
  orderDirection: 'DESC'
};

const LOCAL_STORAGE_KEY = 'user_query';

const InplaceEditableInput = props => {
  const { locale, value, onChange } = props;


}

const TranslationListPage = () => {

  const [profileModalVisible, setProfileModalVisible] = React.useState(false);
  const [portfolioModalVisible, setPortfolioModalVisible] = React.useState(false);
  const [referralBalanceModal, setReferralBalanceModal] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [setPasswordVisible, setSetPasswordVisible] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState();
  const [list, setList] = React.useState([]);
  const [inviteVisible, setInviteVisible] = React.useState(false);
  const context = React.useContext(GlobalContext);
  const [queryInfo, setQueryInfo] = React.useState(reactLocalStorage.getObject(LOCAL_STORAGE_KEY, DEFAULT_QUERY_INFO, true))

  const columnDef = [
    {
      title: 'Key',
      dataIndex: 'key',
      render: (text) => text,
    },
    {
      title: 'Locale',
      dataIndex: 'locale',
      render: (text) => text,
    },
    {
      title: 'Translations',
      dataIndex: 'value',
      render: (text, item) => {
        const { key, local } = item;
        return <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 3 }}
          value={text}
          onChange={e => handleInputChange(item, e.target.value)}
          onBlur={e => handleInputBlur(item, e.target.value)}
        />
      },
    },
  ];

  const handleInputChange = (item, value) => {
    item.value = value;
    setList([...list]);
  }

  const handleInputBlur = async (item, value) => {
    if (item.value !== value) {
      await saveTranslation(item.locale, item.key, item.value);
      await loadList();
    }
  }

  const loadList = async (qi = queryInfo) => {
    try {
      setLoading(true);
      setList(await listAllTranslationsForEdit());
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadList();
  }, []);

  const handleSearchTextChange = text => {
    const newQueryInfo = {
      ...queryInfo,
      text
    }
  }

  const handleFlush = async (value) => {
    await flushTranslation();
    notify.success('Succesfully flushed translation cache. All clients will get the latest translation resources');
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Translations</Title>
          </StyledTitleRow>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button type="primary" ghost onClick={handleFlush}>Flush Update</Button>
          </Space>
          <Table columns={columnDef}
            dataSource={list}
            size="small"

            // scroll={{x: 1000}}
            rowKey={item => `${item.key}.${item.locale}`}
            loading={loading}
            pagination={false}
          />
        </Space>
      </ContainerStyled>

      <Drawer
        visible={referralBalanceModal}
        destroyOnClose={true}
        maskClosable={true}
        title="Referral & Balance"
        onClose={() => setReferralBalanceModal(false)}
        width={400}
      >
        {currentUser && <Space size="large" direction="vertical" style={{ width: '100%', alignItems: 'center' }}>
          <Text code>{currentUser.email}</Text>
          <ReferralBalanceForm user={currentUser} onOk={() => setProfileModalVisible(false)} />

        </Space>}
      </Drawer>
    </LayoutStyled >

  );
};

TranslationListPage.propTypes = {};

TranslationListPage.defaultProps = {};

export default withRouter(TranslationListPage);
