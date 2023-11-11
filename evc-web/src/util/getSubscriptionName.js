import { FormattedMessage } from "react-intl";

export const getSubscriptionName = (type) => {
  return {
    free: <FormattedMessage id="text.proMemberFree"/>,
    pro_member_monthly:  <FormattedMessage id="text.proMemberMonthly"/>,
    pro_member_yearly:  <FormattedMessage id="text.proMemberAnnually"/>
  }[type];
};
