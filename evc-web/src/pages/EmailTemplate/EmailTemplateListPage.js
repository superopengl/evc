import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Button, Table, Input, Modal, Form, Tooltip, Tag, Drawer, Divider } from 'antd';
import HomeHeader from 'components/HomeHeader';
import {
  EditOutlined, SafetyCertificateOutlined, UserAddOutlined, GoogleOutlined, SyncOutlined, QuestionOutlined,
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
import { listEmailTemplate, saveEmailTemplate } from 'services/emailTemplateService';
import { LocaleSelector } from 'components/LocaleSelector';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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

  .ant-drawer-content {
    .ql-editor {
      height: 300px !important;
    } 
  }
`;


const EmailTemplateListPage = () => {

  const [loading, setLoading] = React.useState(true);
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [currentItem, setCurrentItem] = React.useState();
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
      title: 'Template',
      render: (text, item) => {
        return <Space direction="vertical" style={{ width: '100%' }}>
          <Input value={item.subject} readOnly />
          <ReactQuill value={item.body} readOnly modules={{toolbar:false}}/>
        </Space>
      },
    },
    {
      render: (text, item) => {
        return (
          <Space size="small" style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Tooltip placement="bottom" title="Edit">
              <Button shape="circle" icon={<EditOutlined />}
                onClick={() => handleEdit(item)} />
            </Tooltip>
          </Space>
        )
      },
    },
  ];

  const handleEdit = item => {
    setCurrentItem(item);
    setDrawerVisible(true);
  }

  const handleCreateNew = () => {
    setCurrentItem(undefined);
    setDrawerVisible(true);
  }

  const handleInputChange = (item, value) => {
    item.value = value;
    setList([...list]);
  }

  const loadList = async () => {
    try {
      setLoading(true);
      setList(await listEmailTemplate());
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadList();
  }, []);

  const handleSaveNew = async (values) => {
    try {
      setLoading(true);
      const {locale, key, ...payload} = values;
      await saveEmailTemplate(locale, key, payload);
      setDrawerVisible(false);
      await loadList();
    } finally {
      setLoading(false);

    }
  }

  const handleBodyChange = value => {
    debugger;
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Email Template</Title>
          </StyledTitleRow>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button type="primary" ghost onClick={() => handleCreateNew()} icon={<PlusOutlined />} />
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
        // title=" "
        id="scrolling-container"
        visible={drawerVisible}
        closable={true}
        maskClosable={true}
        onClose={() => setDrawerVisible(false)}
        width={600}
        destroyOnClose={true}
      >
        <Form
          layout="vertical"
          onFinish={handleSaveNew}
          initialValues={{...currentItem, body: currentItem?.body || ''}}
        >
          <Form.Item label="Key" name="key" rules={[{ required: true, whitespace: true, message: ' ' }]}>
            <Input allowClear autoFocus disabled={currentItem}/>
          </Form.Item>
          <Form.Item label="Locale" name="locale" rules={[{ required: true, whitespace: true, message: ' ' }]}>
            <LocaleSelector disabled={currentItem} />
          </Form.Item>
          <Form.Item label="Subject" name="subject" rules={[{ required: true, whitespace: true, message: ' ' }]}>
            <Input.TextArea allowClear />
          </Form.Item>
          <Form.Item label="Body" name="body" rules={[{ required: true, whitespace: true, message: ' ' }]}>
            <ReactQuill scrollingContainer="#scrolling-container"/>
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit">Save</Button>
          </Form.Item>
        </Form>
      </Drawer>
    </LayoutStyled >

  );
};

EmailTemplateListPage.propTypes = {};

EmailTemplateListPage.defaultProps = {};

export default withRouter(EmailTemplateListPage);
