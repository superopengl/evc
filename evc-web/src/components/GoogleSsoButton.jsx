import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { withRouter } from 'util/withRouter';
import { GlobalContext } from '../contexts/GlobalContext';
import { ssoGoogle } from 'services/authService';
import { GoogleLogin } from '@react-oauth/google';
import { theme } from 'antd';
import { notify } from 'util/notify';

/**
 * GIS renders this button through one of three different DOMs, and which one you get depends
 * on the **origin**, not just on whether the visitor has a Google session. All three were
 * observed directly; do not assume from one environment what the other does.
 *
 * 1. **Non-FedCM, no session** - the stock "Continue with Google" as real DOM in this page
 *    (`div[role=button].nsm7Bb-HzV7m-LgbsSe`), with only a hidden 0x0 transport iframe. This
 *    is what `localhost` gets, and it is the only path the class-based CSS below reaches.
 * 2. **Non-FedCM, live session** - the personalized "Continue as <name>" variant in a
 *    cross-origin iframe, wrapped in `.L5Fo6c-sM5MNb` (pinned to an inline
 *    `width: fit-content`) under a `.L5Fo6c-bF1uUb` click target.
 * 3. **FedCM** - `accounts.google.com/gsi/button?...&is_fedcm_supported=true` in a
 *    cross-origin iframe inside `.S9gUrf-YoZ4jf`. **This is what production serves**, for the
 *    stock and personalized button alike. The iframe deliberately bleeds past its box
 *    (`margin: -2px -10px`, so a 341px button ships as a 361x44 frame) and the painted button
 *    lands back on the wrapper's own content box.
 *
 * So the frame's interior is unreachable on prod: no radius, border colour or font can be set
 * on it, by design. Width is the one thing that crosses the boundary, via the `width`
 * **parameter** Google applies itself inside the frame. It takes a pixel number only and the
 * auth card is fluid (`max-width: 420px` with fluid padding), so the host is measured and the
 * number re-fed on resize - `width` is in @react-oauth/google's effect deps, so a new value
 * re-issues `renderButton`. That is what puts the button on the same 341px as the email field
 * and the submit button; before it, prod rendered GIS's ~220px intrinsic width.
 *
 * The radius/border/typography rules below therefore only take effect on path 1. On prod the
 * button keeps Google's 4px corners, and `shape` (rectangular | pill | square | circle) is the
 * only lever there is - clipping `.S9gUrf-YoZ4jf` does not help, because the frame's bleed
 * puts the painted corners off the wrapper's own rounding.
 */

/** GIS floors the personalized variant at 200px and caps every variant at 400px. */
const GIS_MIN_WIDTH = 200;
const GIS_MAX_WIDTH = 400;

/**
 * Matches antd's `controlHeightLG`. Hard-coded rather than read off the token because
 * @react-oauth/google pins its own container to 40 for `size="large"` (`containerHeightMap`),
 * so the two have to agree on the literal.
 */
const CONTROL_HEIGHT = 40;

/** Enough for a window drag to settle: every new value re-creates the button. */
const RESIZE_SETTLE_MS = 120;

const clampToGisWidth = value => Math.min(Math.max(value, GIS_MIN_WIDTH), GIS_MAX_WIDTH);

const Styled = styled.div`
  display: ${props => (props.$block ? 'block' : 'inline-flex')};
  width: ${props => (props.$block ? '100%' : 'auto')};
  /* Held open while the first measurement resolves, so gating the button on it costs no
     layout shift. */
  min-height: ${props => (props.$block ? `${CONTROL_HEIGHT}px` : 'auto')};

  /* --- Path 1 only: the stock button as real DOM in this page (non-FedCM, e.g. localhost).
     Production is path 3 and none of this reaches it. ---
     GIS emits its own hashed classes and no stable hook, so these are the class names it
     ships. They have been stable for the life of the library; if a future version renames
     them the button falls back to Google's stock styling rather than breaking. */
  .nsm7Bb-HzV7m-LgbsSe {
    width: ${props => (props.$block ? '100% !important' : 'auto')};
    max-width: none;
    height: ${CONTROL_HEIGHT}px;
    border-radius: ${props => props.$radius}px;
    border-color: var(--evc-line);
    box-shadow: none;
    transition: border-color 0.18s ease, background-color 0.18s ease;

    &:hover, &:focus {
      border-color: var(--evc-text-faint);
      background-color: var(--evc-paper);
      box-shadow: none;
    }
  }

  .nsm7Bb-HzV7m-LgbsSe .nsm7Bb-HzV7m-LgbsSe-BPrWId {
    font-family: var(--evc-font-body);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.005em;
    color: var(--evc-text);
  }

  /* --- Path 2 only: the personalized button's iframe wrapper (non-FedCM + live session).
     Production is path 3, whose wrapper is .S9gUrf-YoZ4jf and cannot be clipped - see the
     note at the top of the file. ---
     Only the frame is ours. Its width already comes from the width parameter, so releasing
     GIS's inline fit-content here just lets the frame sit flush rather than resizing
     anything; the corners are clipped because this wrapper's box does coincide with the
     painted button, unlike path 3's. */
  .L5Fo6c-sM5MNb {
    width: ${props => (props.$block ? '100% !important' : 'auto')};
    max-width: 100%;
    border-radius: ${props => props.$radius}px;
    overflow: hidden;
  }

  /* The click target GIS overlays on the frame, at its own 4px. */
  .L5Fo6c-bF1uUb {
    border-radius: ${props => props.$radius}px;
  }
`;

/**
 * react-google-login wrapped Google's retired gapi platform library and was hard-capped at
 * React 17. @react-oauth/google speaks Google Identity Services instead.
 *
 * GIS only hands out the id_token that the backend decodes from its own rendered button, so
 * the previous `render` prop - a custom antd Button - has no equivalent. The text/theme/size/
 * shape/width props below are the whole styling surface Google exposes; anything past that is
 * the CSS above, and on prod's FedCM path not even that.
 */
const GoogleSsoButton = props => {
  const context = React.useContext(GlobalContext);
  const { setUser } = context;
  const { referralCode, width, block = false } = props;

  // Every control this sits next to is size="large", so it is borderRadiusLG that has to
  // match - 10px, which antd derives from the theme's borderRadius: 8 rather than exposing
  // directly. Reading the token keeps the two in step if the palette is ever retuned.
  const { token: antdToken } = theme.useToken();

  const hostRef = React.useRef(null);
  const [measuredWidth, setMeasuredWidth] = React.useState(null);

  React.useLayoutEffect(() => {
    const host = hostRef.current;
    if (!block || !host) {
      return undefined;
    }

    // The host is `display: block; width: 100%`, so the card sizes it and the button inside
    // never does - measuring it cannot feed back into what is being measured.
    const read = () => setMeasuredWidth(
      clampToGisWidth(Math.round(host.getBoundingClientRect().width))
    );

    read();

    let timer;
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(read, RESIZE_SETTLE_MS);
    });
    observer.observe(host);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [block]);

  const handleGoogleSso = async (response) => {
    const token = response?.credential;
    if (!token) {
      notify.error('Failed to log in with Google');
      return;
    }
    const user = await ssoGoogle(token, referralCode);
    if (user) {
      setUser(user);
      props.history.push('/');
    } else {
      notify.error('Failed to log in with Google');
    }
  };

  // A caller that passes an explicit `width` keeps it; `block` measures its own.
  const renderedWidth = block ? measuredWidth : width;

  // Rendering before the first measurement would build the button once at its intrinsic
  // width and again at the measured one, i.e. create the iframe twice. The measurement is a
  // layout effect, so it lands before paint and this gate is never visible.
  const ready = !block || measuredWidth !== null;

  return <Styled ref={hostRef} $block={block} $radius={antdToken.borderRadiusLG}>
    {ready && <GoogleLogin
      onSuccess={handleGoogleSso}
      onError={() => notify.error('Failed to log in with Google')}
      text="continue_with"
      theme="outline"
      size="large"
      shape="rectangular"
      width={renderedWidth ?? undefined}
      containerProps={block ? { style: { width: '100%' } } : undefined}
    />}
  </Styled>;
};

GoogleSsoButton.propTypes = {
  referralCode: PropTypes.string,
  width: PropTypes.number,
  block: PropTypes.bool,
};

export default withRouter(GoogleSsoButton);
