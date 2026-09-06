
import React from 'react';
import { Affix, Button, Modal } from 'antd';
import { AiOutlineMessage } from "react-icons/ai";
import styled from 'styled-components';
import ContactForm from 'components/ContactForm';

/**
 * A rounded square, not a disc. 18px on a 60px tile is the same squircle the logo mark, the
 * hero's slogan icons and the data panes use, so the one element that floats over everything
 * is shaped like the rest of the site rather than like a stock chat bubble.
 *
 * `shape="square"` on the Button is what says it; the radius override tunes antd's 8px to the
 * page's scale.
 */
const AffixContactButton = styled(Button)`
width: 60px;
height: 60px;
display: flex;
align-items: center;
justify-content: center;
padding: 0;
border: 2px solid white;
border-radius: 18px;
background-color: rgba(63, 158, 72, 0.8);
color: white;

&:focus,&:hover,&:active {
color: white;
background-color: rgba(63, 158, 72, 0.8);
border: 2px solid white;
}
`;
export const ContactWidget = () => {
  const [modalVisible, setModalVisible] = React.useState(false);

  return <>
    {/*
      * The z-index is not decoration. Fixed positioning alone leaves this at z-index auto,
      * and the homepage hero raises its own content to z-index 1 (see Container's `> *` rule
      * in homeAreas/HomeCarouselArea) so it can sit above the four-band gradient painted on
      * its ::before. Nothing between them establishes a stacking context - ant-layout-content
      * is positioned but z-index auto - so the two compare directly at the root and the
      * catch phrase won, painting over the button whenever the hero was in view.
      *
      * 10 clears the page's own layers while staying under the fixed header (19), the cookie
      * bar (999) and the mobile nav drawer (1001), all of which should cover this button.
      */}
    <Affix style={{ position: 'fixed', bottom: 80, right: 20, zIndex: 10 }}>
      <AffixContactButton type="primary" shape="square" size="large" onClick={() => setModalVisible(true)}>
        <AiOutlineMessage size={36} />
      </AffixContactButton>
    </Affix>
    <Modal
      title="Contact Us"
      open={modalVisible}
      onOk={() => setModalVisible(false)}
      onCancel={() => setModalVisible(false)}
      footer={null}
      destroyOnHidden={true}
      // centered={true}
      mask={{ closable: false }}
    >
      <ContactForm onDone={() => setModalVisible(false)}></ContactForm>
    </Modal>
  </>
}