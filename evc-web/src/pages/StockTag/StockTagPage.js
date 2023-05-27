import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Button, Table, Modal, Tooltip, Form, Input } from 'antd';
import HomeHeader from 'components/HomeHeader';
import {
  DeleteOutlined, DeleteRowOutlined, EditFilled, EditOutlined, EditTwoTone, PlusOutlined, QuestionOutlined
} from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import { Space } from 'antd';
import { setPasswordForUser } from 'services/userService';
import { inviteUser, impersonate } from 'services/authService';
import { reactLocalStorage } from 'reactjs-localstorage';
import { GlobalContext } from 'contexts/GlobalContext';
import { deleteStockTag, listStockTags, saveStockTag } from 'services/stockTagService';
import { CirclePicker, SliderPicker } from 'react-color';
import { Tag } from 'antd';
import StockTag from 'components/StockTag';
import * as tinycolor from 'tinycolor2';

const { Title, Text } = Typography;

const ContainerStyled = styled.div`
  margin: 5rem auto 2rem;
  max-width: 600px;
  width: 100%;

  .ant-btn.ant-btn-link {
    padding-right: 0;
  }
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

const ColorPicker = props => {
  const { value, onChange } = props;

  const handleChange = color => {
    onChange(color.hex);
  }

  return <SliderPicker color={value} onChange={handleChange} />
}


const StockTagPage = () => {

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);
  const [currentTag, setCurrentTag] = React.useState();
  const [modalVisible, setModalVisible] = React.useState(false);

  const handleDelete = async (tag) => {
    Modal.confirm({
      title: <>Delete tag <strong>{tag.name}</strong>?</>,
      onOk: async () => {
        setLoading(true);
        await deleteStockTag(tag.id);
        await loadList();
        setLoading(false);
      },
      maskClosable: true,
      okButtonProps: {
        danger: true
      },
      okText: 'Yes, delete it!'
    });
  }

  const handleEdit = (tag) => {
    setCurrentTag(tag);
    setModalVisible(true);
  }

  const handleNewTag = () => {
    setCurrentTag();
    setModalVisible(true);
  }

  const handleSubmit = async values => {
    try {
      setLoading(true);
      await saveStockTag({ ...currentTag, ...values });
      setModalVisible(false);
      await loadList();
    } finally {
      setLoading(false);
    }
  }

  const columnDef = [
    {
      render: (value, item) => <StockTag color={item.color}>{item.name}</StockTag>,
    },
    {
      // fixed: 'right',
      // width: 200,
      render: (value, item) => {
        return (
          <Space size="small" style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Tooltip placement="bottom" title="Edit tag">
              <Button shape="link" onClick={() => handleEdit(item)} icon={<EditOutlined />}></Button>
            </Tooltip>
            <Tooltip placement="bottom" title="Delete tag">
              <Button shape="link" danger onClick={() => handleDelete(item)} icon={<DeleteOutlined/>} ></Button>
            </Tooltip>
          </Space>
        )
      },
    },
  ];

  const loadList = async () => {
    setLoading(true);
    const list = await listStockTags();
    setList(list);
    setLoading(false);
  }

  React.useEffect(() => {
    loadList();
  }, []);


  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Stock Tags</Title>
          </StyledTitleRow>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button type="primary" ghost icon={<PlusOutlined />} onClick={handleNewTag}>New Tag</Button>
          </Space>
          <Table columns={columnDef}
            dataSource={list}
            size="large"
            rowKey="id"
            loading={loading}
            pagination={false}
            showHeader={false}
            bordered={false}
            // style={{minWidth}}
          // pagination={queryInfo}
          // onChange={handleTableChange}
          // onRow={(record, index) => ({
          //   onDoubleClick: e => {
          //     setCurrentId(record.id);
          //     setFormVisible(true);
          //   }
          // })}
          />
        </Space>
      </ContainerStyled>
      <Modal
        visible={modalVisible}
        destroyOnClose={true}
        maskClosable={false}
        title={currentTag ? `Edit tag ${currentTag.name}` : 'New tag'}
        closable={true}
        onOk={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form initialValues={{color: tinycolor.random().toHexString(), ...currentTag}} onFinish={handleSubmit}>
          <Form.Item label="Name" name="name" rules={[{ required: true, whitespace: true, message: ' ' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Color" name="color" rules={[{ required: true, whitespace: true, message: 'Color is required' }]}>
            <ColorPicker />
          </Form.Item>
          <Form.Item style={{marginTop: 40}}>
            <Button block htmlType="submit">Save</Button>
          </Form.Item>
        </Form>

      </Modal>
    </LayoutStyled >

  );
};

StockTagPage.propTypes = {};

StockTagPage.defaultProps = {};

export default withRouter(StockTagPage);
