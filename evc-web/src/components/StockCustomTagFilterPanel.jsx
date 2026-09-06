import React from 'react';
import PropTypes from 'prop-types';
import { CheckOutlined, CloseOutlined, TagFilled } from '@ant-design/icons';
import { Button, Tag, Row, Col, Input, Alert, Typography } from 'antd';
import { GlobalContext } from 'contexts/GlobalContext';
import styled from 'styled-components';
import { createCustomTag, deleteCustomTag } from 'services/watchListService';
import { notify } from 'util/notify';
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl';
import { modal } from 'util/antdStatic';

const { Paragraph } = Typography;
const StyledTag = styled(Tag)`
&:hover {
  cursor: pointer;
}

font-size: 14px;
padding: 5px 12px;
margin: 0;

`;

// Inherit the tag's own text colour rather than pinning near-black: the selected tag is
// solid brand blue, where a dark cross all but disappears.
const StyledCloseButton = styled.span`
color: inherit;
opacity: 0.55;

&:hover {
  opacity: 1;
}
`;

// A border in the tag's own text colour, matching the stock cards (StockCustomTagSelect).
// It has to be an inline style rather than a rule on StyledTag: antd 6's `&.ant-tag-solid`
// pins `border-color: transparent` at a higher specificity than a styled-components class,
// so the selected tag would come out borderless.
const TAG_BORDER_STYLE = { borderColor: 'currentColor' };

const StyledNewTagInput = styled(Input.Search)`
input {
  // font-size: 12px;
}
`;

export const StockCustomTagFilterPanel = (props) => {

  const { onChange = () => { }, onDeleteTag, onAddTag, value = [] } = props;

  const context = React.useContext(GlobalContext);
  const [tagName, setTagName] = React.useState('');
  const intl = useIntl();
  const { customTags } = context;

  const isSelected = (tagId) => {
    return (value || []).includes(tagId);
  }

  const toggleTag = (tagId) => {
    const index = value.indexOf(tagId);
    if (index === -1) {
      onChange([...value, tagId]);
    } else {
      onChange(value.filter(x => x !== tagId));
    }
  };

  const handleDeleteTag = async (e, tag) => {
    e.stopPropagation();
    modal.confirm({
      title: intl.formatMessage({id: 'text.deleteCustomTagTitle'}, {tag: <Tag>{tag.name}</Tag>}),
      content: intl.formatMessage({id: 'text.deleteCustomTagMessage'}),
      mask: { closable: true },
      onOk: async () => {
        await deleteCustomTag(tag.id);
        onDeleteTag(tag.id);
      },
      okText: intl.formatMessage({id: 'text.delete'}),
      okButtonProps: {
        danger: true
      }
    });
  }

  const handleCreateTag = async (value, e) => {
    e.stopPropagation();
    if (value) {
      await createCustomTag(value);
      onAddTag();
      setTagName('');
      notify.success(intl.formatMessage({id: 'text.savedCustomTag'}, {tag: <strong>{value}</strong>}));
    }
  }



  return (<>
    {!customTags?.length && <Paragraph type="secondary">
      <FormattedMessage id="text.emptyCustomTagMessage" values={{icon: <TagFilled style={{ color: '#fadb14' }} />}} />
    </Paragraph>}
    <Row gutter={[8, 8]}>
      {(customTags || [])
        .map((t, i) => <Col key={i}>
          {/*
            Same colour as the tags on the stock cards below (StockCustomTagSelect): `processing`
            is antd's status colour for `colorInfo`, which src/antdTheme.js pins to the brand blue.
            Selection is carried by the variant instead of by the colour - antd 6 defaults Tag to
            `variant="filled"` (pale `colorInfoBg` behind `colorInfo` text, matching the cards), and
            only `solid` puts `colorInfo` on the background with white text.
          */}
          <StyledTag
            color="processing"
            variant={isSelected(t.id) ? 'solid' : 'filled'}
            style={TAG_BORDER_STYLE}
            onClick={() => toggleTag(t.id)}
          >
            {t.name} <StyledCloseButton onClick={e => handleDeleteTag(e, t)}>
              <CloseOutlined style={{ marginLeft: 8 }} />
            </StyledCloseButton>
          </StyledTag>
        </Col>)}
      <Col>
        <div style={{ display: 'flex' }}>
          <StyledNewTagInput placeholder={intl.formatMessage({id: 'text.createTag'})}
            // size="small"
            maxLength={16}
            allowClear
            value={tagName}
            onChange={e => setTagName(e.target.value)}
            enterButton={<Button type="primary" icon={<CheckOutlined />}></Button>}
            onSearch={handleCreateTag}
          />
        </div>
      </Col>
    </Row>
  </>
  );
};

StockCustomTagFilterPanel.propTypes = {
  onChange: PropTypes.func.isRequired,
  onDeleteTag: PropTypes.func.isRequired,
  onAddTag: PropTypes.func.isRequired,
  value: PropTypes.arrayOf(PropTypes.string),
};

