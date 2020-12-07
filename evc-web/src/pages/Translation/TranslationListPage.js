import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Button, Table, Input, Modal, Form, Tooltip, Tag, Drawer, Divider } from 'antd';
import HomeHeader from 'components/HomeHeader';
import {
  DeleteOutlined, SafetyCertificateOutlined, UserAddOutlined, GoogleOutlined, SyncOutlined, QuestionOutlined,
  IdcardOutlined, SearchOutlined,
  UserOutlined,
  PlusOutlined
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
import { flushTranslation, listAllTranslationsForEdit, saveTranslation, newLocaleResource } from 'services/translationService';
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


const TranslationListPage = () => {

  const [loading, setLoading] = React.useState(true);
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [list, setList] = React.useState([]);

  const columnDef = [
    {
      title: 'Key',
      dataIndex: 'key',
      sorter: {
        compare: (a, b) => a.key.localeCompare(b.keyy)
      },
      render: (text) => text,
    },
    {
      title: 'Locale',
      dataIndex: 'locale',
      sorter: {
        compare: (a, b) => a.locale.localeCompare(b.locale)
      },
      render: (text) => {
        switch (text) {
          case 'zh-CN':
            return '简体中文';
          case 'zh-TW':
            return '繁體中文';
          case 'en-US':
          default:
            return 'English';
        }
      },
    },
    {
      title: 'Translations',
      dataIndex: 'value',
      render: (text, item) => {
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

  const loadList = async () => {
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

  const handleFlush = async (value) => {
    await flushTranslation();
    notify.success('Succesfully flushed translation cache. All clients will get the latest translation resources');
  }

  const handleSaveNew = async (values) => {
    try{
      setLoading(true);
      await newLocaleResource(values);
      setDrawerVisible(false);
      await loadList();
    }finally{
      setLoading(false);

    }
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
            <Button type="primary" ghost onClick={handleFlush}>Flush Cache</Button>
            <Button type="primary" ghost onClick={() => setDrawerVisible(true)} icon={<PlusOutlined/>} />
          </Space>
          <Table columns={columnDef}
            dataSource={list}
            size="small"
            rowKey={item => `${item.key}.${item.locale}`}
            loading={loading}
            pagination={false}
          />
        </Space>
      </ContainerStyled>
      <Drawer
        title="New Translation"
        visible={drawerVisible}
        closable={true}
        maskClosable={true}
        onClose={() => setDrawerVisible(false)}
        width={400}
        destroyOnClose={true}
      >
        <Form 
          layout="vertical"
          onFinish={handleSaveNew}
        >
          <Form.Item label="Key" name="key" rules={[{required: true, whitespace: true, message: ' '}]}>
            <Input allowClear autoFocus/>
          </Form.Item>
          <Form.Item label="English" name="en-US" rules={[{required: true, whitespace: true, message: ' '}]}>
            <Input.TextArea allowClear />
          </Form.Item>
          <Form.Item label="简体中文" name="zh-CN" rules={[{required: true, whitespace: true, message: ' '}]}>
            <Input.TextArea allowClear />
          </Form.Item>
          <Form.Item label="繁體中文" name="zh-TW" rules={[{required: true, whitespace: true, message: ' '}]}>
            <Input.TextArea allowClear />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit">Save</Button>
          </Form.Item>
        </Form>
      </Drawer>
    </LayoutStyled >

  );
};

TranslationListPage.propTypes = {};

TranslationListPage.defaultProps = {};

export default withRouter(TranslationListPage);
