
import React from 'react';
import { Upload, Button, Modal } from 'antd';
import { getOperationStatus } from 'services/dataService';
import { interval } from 'rxjs';
import { startWith } from 'rxjs/operators';
import PropTypes from 'prop-types';
import { notify } from 'util/notify';
import { API_BASE_URL } from 'services/http';
import { UploadOutlined } from '@ant-design/icons';
import { from } from 'rxjs';


export const LongRunningActionButton = props => {
  const { operationKey, confirmMessage, onOk, buttonText, onComplete, type, uploadAction } = props;

  const [loading, setLoading] = React.useState(false);
  // const [ping$, setPing$] = React.useState();
  const pingSubRef = React.useRef();

  const load = async () => {
    const result = await getOperationStatus(operationKey);

    if (result) {
      setLoading(true);
    }
  }

  React.useEffect(() => {
    const load$ = from(load()).subscribe();

    return () => {
      load$.unsubscribe();
      pingSubRef.current?.unsubscribe();
    }
  }, []);

  React.useEffect(() => {
    if (loading) {
      pingSubRef.current?.unsubscribe();
      pingSubRef.current = interval(5 * 1000)
        .pipe(
          startWith(0),
        )
        .subscribe(async () => {
          const result = await getOperationStatus(operationKey);
          if (!result) {
            setLoading(false);
          }
        });
    } else {
      pingSubRef.current?.unsubscribe();
    }
  }, [loading]);

  const handleConfirm = () => {
    Modal.confirm({
      title: buttonText,
      closable: true,
      maskClosable: true,
      content: confirmMessage,
      onOk: async () => {
        await onOk();
        setLoading(true);
      }
    });
  }

  const uploadProps = {
    action: `${API_BASE_URL}${uploadAction}?operation=${operationKey}`,
    accept: '.csv, text/csv, application/vnd.ms-excel, text/x-csv, application/x-csv, application/csv, text/x-comma-separated-values, text/comma-separated-values',
    withCredentials: true,
    showUploadList: false,
    multiple: false,
    // beforeUpload: file => {
    //   if (file.type !== 'text/csv') {
    //     notify.error('Invalid file format', `Uploaded file type '${file.type}' is invalid. Please upload a CSV file.`);
    //   }
    // },
    onChange: (info) => {
      const { file } = info;
      const status = file.status;
      switch (status) {
        case 'uploading': {
          setLoading(true);
          break;
        }
        case 'error': {
          notify.error('Failed to upload file', info.file.response);
          setLoading(false);
          break;
        }
        case 'removed':
        case 'done':
        default: {
          onComplete();
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
  onComplete: PropTypes.func,
  uploadAction: PropTypes.string,
  type: PropTypes.oneOf(['button', 'upload'])
};

LongRunningActionButton.defaultProps = {
  type: 'button',
  confirmMessage: 'This operation may take several minutes to complete. In the mean time, there is no functional impact when in progress.',
  onOk: () => { },
  onComplete: () => { }
};