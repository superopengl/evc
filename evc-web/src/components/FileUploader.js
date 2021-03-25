import React from 'react';
import PropTypes from 'prop-types';
import { Upload, Typography } from 'antd';
import * as _ from 'lodash';
import styled from 'styled-components';
import { searchFile } from 'services/fileService';
import { saveAs } from 'file-saver';
import { AiOutlineUpload } from 'react-icons/ai';
import ReactDOM from 'react-dom';

const { Dragger } = Upload;
const { Text } = Typography;

const Container = styled.div`
& {
  .ant-upload-list-item {
    height: 60px;
  }
  .ant-upload-list-item-card-actions-btn {
    // background-color: yellow !important;
    width: 60px;
    height: 60px;
    position: relative;
    opacity: 0.5;
  }

  .ant-upload-list-item-info > span {
    display: flex;
    align-items: center;
  }

  .ant-upload-text-icon {
    display: inline-block;
  }
  .ant-upload-list-item-name {
    width: auto;
    padding-left: 8px;
  }
}`;



export const FileUploader = (props) => {
  const { onChange, onUploadingChange, showUploadList } = props;

  const [fileList, setFileList] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const loadFileList = async () => {
    const { value } = props;
    if (value?.length) {
      try {
      setLoading(true);
      const list = await searchFile(value);
      const fileList = list.map(x => ({
        uid: x.id,
        name: x.fileName,
        status: 'done',
        url: x.location,
      }));
      ReactDOM.unstable_batchedUpdates(() => {
        setFileList(fileList);
        setLoading(false);
      })
    }catch{
      setLoading(false);

    }
    }
  }

  React.useEffect(() => {
    if (onUploadingChange) {
      onUploadingChange(loading);
    }
  }, [loading]);

  React.useEffect(() => {
    loadFileList()
  }, []);

  const handleChange = (info) => {
    const { file, fileList } = info;
    setFileList(fileList);

    onChange(fileList.filter(f => f.status === 'done').map(f => _.get(f, 'response.id', f.uid)));

    const uploading = file.status === 'uploading';
    setLoading(uploading);
  };

  const handlePreview = file => {
    const fileName = file.name || file.response.fileName;
    const url = file.url || `${process.env.REACT_APP_EVC_API_ENDPOINT}/file/${file.response.id}/download`;
    saveAs(url, fileName);
  }

  const handleRemove = file => {
    onChange(fileList.map(f => _.get(f, 'response.id', f.uid)));
  }

  const { size, disabled } = props;

  const maxSize = size || 3;

  return (
    <Container className="clearfix">
      <Dragger
        multiple={true}
        action={`${process.env.REACT_APP_EVC_API_ENDPOINT}/file`}
        withCredentials={true}
        accept="image/*"
        listType="picture"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        onRemove={handleRemove}
        // beforeUpload={handleBeforeUpload}
        showUploadList={showUploadList}
        // showUploadList={false}
        // iconRender={() => <UploadOutlined />}
        disabled={disabled || fileList.length >= maxSize}
      // showUploadList={true}
      >
        {disabled ? <Text type="secondary">File upload is disabled</Text>
          : <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
            <AiOutlineUpload size={30} style={{ fill: 'rgba(0, 0, 0, 0.65)' }} />
          Click or drag file to this area to upload. 
          <br/>Must be consistent with the name in the identity. Up to 3 photos.
        </div>}
      </Dragger>
      {/* {fileList.map((f, i) => <FileUploadItem key={i} value={f} />)} */}
    </Container>
  );

}

FileUploader.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  size: PropTypes.number,
  disabled: PropTypes.bool,
  showUploadList: PropTypes.any,
  onChange: PropTypes.func,
};

FileUploader.defaultProps = {
  disabled: false,
  showUploadList: {
    showPreviewIcon: true,
    showDownloadIcon: false,
    showRemoveIcon: true,
  },
  onChange: () => {}
};
