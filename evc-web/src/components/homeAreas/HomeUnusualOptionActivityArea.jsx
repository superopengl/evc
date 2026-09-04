import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import UnusualOptionsActivityPage from 'pages/AdminDashboard/UnusualOptionsActivityPage';
import HomeSection from 'components/homeAreas/HomeSection';

export const HomeUnusualOptionActivityArea = props => {
  return (
    <HomeSection
      tone="mint"
      wide
      title={<FormattedMessage id="menu.unusualOptionsActivity" />}
    >
      <UnusualOptionsActivityPage size="small" />
    </HomeSection>
  )
}

HomeUnusualOptionActivityArea.propTypes = {
  onSymbolClick: PropTypes.func,
};

export default HomeUnusualOptionActivityArea;
