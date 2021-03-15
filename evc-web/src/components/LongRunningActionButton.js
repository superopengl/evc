
import React from 'react';
import { Link } from 'react-router-dom';
import { Typography, Row, Col, Upload, Alert, Button, Space, Modal } from 'antd';
import { refreshMaterializedViews, getOperationStatus } from 'services/dataService';
import { MemberOnlyCard } from 'components/MemberOnlyCard';
import { interval } from 'rxjs';
import { startWith } from 'rxjs/operators';
import PropTypes from 'prop-types';
import { notify } from 'util/notify';
import { API_BASE_URL } from 'services/http';
import { UploadOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;


export const LongRunningActionButton = props => {
  const { operationKey, confirmMessage, onOk, buttonText, type, uploadAction } = props;

  const [loading, setLoading] = React.useState(false);
  let ping$;

  const startPingStatus = () => {
    ping$ = interval(5 * 1000)
      .pipe(
        startWith(0),
      )
      .subscribe(async () => {
        const result = await getOperationStatus(operationKey);
        if (!result) {
          ping$.unsubscribe();
          setLoading(false);
        }
      });
  }

  const load = async () => {
    const result = await getOperationStatus(operationKey);

    if (result) {
      setLoading(true);
      startPingStatus();
    }
  }

  React.useEffect(() => {
    load();
    return () => {
      ping$?.unsubscribe();
    }
  }, []);

  const handleConfirm = () => {
    Modal.confirm({
      title: buttonText,
      closable: true,
      maskClosable: true,
      content: confirmMessage,
      onOk: async () => {
        setLoading(true);
        await onOk();
        startPingStatus();
      }
    });
  }

  const uploadProps = {
    action: `${API_BASE_URL}${uploadAction}?operation=${operationKey}`,
    accept: '.csv',
    withCredentials: true,
    showUploadList: false,
    multiple: false,
    beforeUpload: file => {
      if (file.type !== 'text/csv') {
        notify.error('Invalid file format', 'Please upload a valid CSV file');
      }
    },
    onChange: (info) => {
      const { file } = info;
      const status = file.status;
      switch (status) {
        case 'uploading': {
          setLoading(true);
          startPingStatus();
          break;
        }
        case 'error': {
          notify.error('Failed to upload file', info.file.response);
          ping$?.unsubscribe();
          setLoading(false);
          break;
        }
        case 'removed':
        case 'done':
        default: {
          ping$?.unsubscribe();
          setLoading(false);
          break;
        }
      }
    }
  };

  return <>
    {type === 'upload' ?
      <Upload {...uploadProps}>
        <Button loading={loading} icon={<UploadOutlined />} type="primary">{buttonText}</Button>
      </Upload> :
      <Button loading={loading} type="primary" onClick={() => handleConfirm()}>{buttonText}</Button>}
  </>
}


LongRunningActionButton.propTypes = {
  operationKey: PropTypes.string.isRequired,
  confirmMessage: PropTypes.any,
  buttonText: PropTypes.string.isRequired,
  onOk: PropTypes.func.isRequired,
  uploadAction: PropTypes.string,
  type: PropTypes.oneOf(['button', 'upload'])
};

LongRunningActionButton.defaultProps = {
  type: 'button',
  confirmMessage: 'This operation may take several minutes to complete. In the mean time, there is no functional impact when in progress.',
  onOk: () => { }
};