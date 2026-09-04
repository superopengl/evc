import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { API_BASE_URL } from 'services/http';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import { i18nChangeLanguage } from '@wangeditor/editor';
import '@wangeditor/editor/dist/css/style.css';

// v5 defaults to zh-CN; the v4 config this replaced set `lang: 'en'`.
i18nChangeLanguage('en');

/**
 * wangeditor-for-react wrapped wangEditor 4 and was capped at React 17. wangEditor 5
 * (@wangeditor/editor-for-react) has a different shape: the toolbar is a separate component, the
 * v4 `menus` array and `uploadImgHooks` are replaced by toolbarConfig/MENU_CONF, and onChange
 * hands back the editor rather than an HTML string.
 */
const RichTextInput = (props) => {
  const { value = '', disabled = false, onChange = () => { } } = props;
  const [editor, setEditor] = React.useState(null);

  React.useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  // readOnly is only read when the editor is created, so track it separately.
  React.useEffect(() => {
    if (!editor) {
      return;
    }
    if (disabled) {
      editor.disable();
    } else {
      editor.enable();
    }
  }, [editor, disabled]);

  const toolbarConfig = React.useMemo(() => ({
    // v5 renames every menu key, so excluding the few we never offered is safer than
    // re-listing all twenty by hand - an unknown key throws at runtime.
    excludeKeys: ['group-video', 'insertVideo', 'uploadVideo', 'emotion', 'fullScreen'],
  }), []);

  const editorConfig = React.useMemo(() => ({
    placeholder: '',
    readOnly: disabled,
    MENU_CONF: {
      uploadImage: {
        server: `${API_BASE_URL}/file`,
        fieldName: 'file',
        maxNumberOfFiles: 1,
        timeout: 20 * 1000,
        withCredentials: true,
        customInsert(result, insertFn) {
          const { id, fileName } = result;
          const url = `${API_BASE_URL}/file/${id}/download`;
          insertFn(url, fileName, url);
        },
      },
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  return <div style={{ border: '1px solid #d9d9d9', borderRadius: 6 }}>
    <Toolbar
      editor={editor}
      defaultConfig={toolbarConfig}
      mode="default"
      style={{ borderBottom: '1px solid #d9d9d9' }}
    />
    <Editor
      defaultConfig={editorConfig}
      value={value}
      onCreated={setEditor}
      onChange={e => onChange(e.getHtml())}
      mode="default"
      style={{ minHeight: 300, overflowY: 'hidden' }}
    />
  </div>;
};

RichTextInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

export default withRouter(RichTextInput);
