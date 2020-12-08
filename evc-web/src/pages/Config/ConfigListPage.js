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
import { listConfig, saveConfig } from 'services/configService';

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

const NEW_ITEM = Object.freeze({
  isNew: true,
  key: '',
});

const ConfigListPage = () => {

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([{ ...NEW_ITEM }]);

  const columnDef = [
    {
      title: 'Key',
      dataIndex: 'key',
      sorter: {
        compare: (a, b) => a.key.localeCompare(b.keyy)
      },
      render: (text, item) => item.isNew ?
        <Input
          allowClear
          autoFocus
          value={text}
          onChange={e => handleNewItemKeyChange(item, e.target.value)}
        />
        : text,
    },
    {
      title: 'Value',
      dataIndex: 'value',
      sorter: {
        compare: (a, b) => (a.value || '').localeCompare(b.value)
      },
      render: (text, item) => <Input.TextArea
        autoSize={{ minRows: 1, maxRows: 3 }}
        value={text}
        allowClear={item.isNew}
        onChange={e => handleInputChange(item, e.target.value)}
        onBlur={e => handleInputBlur(item, e.target.value)}
      />
    },
    {
      render: (text, item) => <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          {item.isNew && <Button type="primary" ghost shape="circle" icon={<PlusOutlined />} disabled={!isItemValid(item)} onClick={() => handleSaveNew(item)}/>}
        </Space>
    },
  ];

  const isItemValid = (item) => {
    return !!item.key;
  }

  const handleNewItemKeyChange = (item, keyName) => {
    item.key = keyName;
    setList([...list]);
  }

  const handleInputChange = (item, value) => {
    item.value = value;
    setList([...list]);
  }

  const handleInputBlur = async (item, value) => {
    if (item.isNew) return;
    if (item.value !== value) {
      await saveConfig(item.key, value);
      await loadList();
    }
  }

  const loadList = async () => {
    try {
      setLoading(true);
      const data = await listConfig();
      data.unshift({ ...NEW_ITEM });
      setList(data);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadList();
  }, []);


  const handleSaveNew = async (item) => {
    if(!isItemValid(item)) return;
    try {
      setLoading(true);
      await saveConfig(item.key, item.value);
      await loadList();
    } finally {
      setLoading(false);
    }
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>System Configurations</Title>
          </StyledTitleRow>
          <Table columns={columnDef}
            dataSource={list}
            size="small"
            rowKey="key"
            loading={loading}
            pagination={false}
          />
        </Space>
      </ContainerStyled>
    </LayoutStyled >
  );
};

ConfigListPage.propTypes = {};

ConfigListPage.defaultProps = {};

export default withRouter(ConfigListPage);
