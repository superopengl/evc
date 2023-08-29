import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Button, Table, Input } from 'antd';
import HomeHeader from 'components/HomeHeader';
import {
  PlusOutlined
} from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import { Space } from 'antd';
import * as _ from 'lodash';
import { flushTranslation, listAllTranslationsForEdit, saveTranslation, newLocaleResource } from 'services/translationService';
import { notify } from 'util/notify';

const { Title } = Typography;

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

const TranslationListPage = () => {

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
      title: 'English',
      dataIndex: 'en-US',
      sorter: {
        compare: (a, b) => a['en-US'].localeCompare(b['en-US'])
      },
      render: (text, item) => <Input.TextArea
        autoSize={{ minRows: 1, maxRows: 3 }}
        value={text}
        allowClear={item.isNew}
        onChange={e => handleInputChange(item, 'en-US', e.target.value)}
        onBlur={e => handleInputBlur(item, 'en-US', e.target.value)}
      />
    },
    {
      title: '简体中文',
      dataIndex: 'zh-CN',
      sorter: {
        compare: (a, b) => a['zh-CN'].localeCompare(b['zh-CN'])
      },
      render: (text, item) => <Input.TextArea
        autoSize={{ minRows: 1, maxRows: 3 }}
        value={text}
        allowClear={item.isNew}
        onChange={e => handleInputChange(item, 'zh-CN', e.target.value)}
        onBlur={e => handleInputBlur(item, 'zh-CN', e.target.value)}
      />
    },
    {
      title: '繁體中文',
      dataIndex: 'zh-TW',
      sorter: {
        compare: (a, b) => a['zh-TW'].localeCompare(b['zh-TW'])
      },
      render: (text, item) => <Input.TextArea
        autoSize={{ minRows: 1, maxRows: 3 }}
        value={text}
        allowClear={item.isNew}
        onChange={e => handleInputChange(item, 'zh-TW', e.target.value)}
        onBlur={e => handleInputBlur(item, 'zh-TW', e.target.value)}
      />
    },
    {
      render: (text, item) => <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
        {item.isNew && <Button type="primary" ghost shape="circle" icon={<PlusOutlined />} disabled={!isItemValid(item)} onClick={() => handleSaveNew(item)} />}
      </Space>
    },
  ];

  const isItemValid = (item) => {
    return item.key && item['en-US'] && item['zh-CN'] && item['zh-TW'];
  }

  const handleNewItemKeyChange = (item, keyName) => {
    item.key = keyName;
    setList([...list]);
  }

  const handleInputChange = (item, locale, value) => {
    item[locale] = value;
    setList([...list]);
  }

  const handleInputBlur = async (item, locale, value) => {
    if (item.isNew) return;
    // if (item.value !== value) {
    await saveTranslation(locale, item.key, value);
    // await loadList();
    // }
  }

  const loadList = async () => {
    try {
      setLoading(true);
      const data = await listAllTranslationsForEdit();
      data.unshift({ ...NEW_ITEM });
      setList(data);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadList();
  }, []);

  const handleFlush = async () => {
    await flushTranslation();
    notify.success('Succesfully flushed translation cache. All clients will get the latest translation resources');
  }

  const handleSaveNew = async (item) => {
    if (!isItemValid(item)) return;
    try {
      setLoading(true);
      await newLocaleResource(item);
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
            <Title level={2} style={{ margin: 'auto' }}>Translations</Title>
          </StyledTitleRow>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button type="primary" ghost onClick={handleFlush}>Flush Cache</Button>
          </Space>
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

TranslationListPage.propTypes = {};

TranslationListPage.defaultProps = {};

export default withRouter(TranslationListPage);
