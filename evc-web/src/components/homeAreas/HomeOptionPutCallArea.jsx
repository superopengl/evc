import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import OptionPutCallPage from 'pages/AdminDashboard/OptionPutCallPage';
import HomeSection from 'components/homeAreas/HomeSection';

export const HomeOptionPutCallArea = props => {
  return (
    <HomeSection
      tone="sub"
      wide
      title={<FormattedMessage id="menu.optionPutCall" />}
    >
      <OptionPutCallPage size="small" />
    </HomeSection>
  )
}

HomeOptionPutCallArea.propTypes = {
  onSymbolClick: PropTypes.func,
};

export default HomeOptionPutCallArea;
