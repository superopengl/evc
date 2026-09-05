import { getManager } from '../dataSource';
import { EmailTemplate } from '../entity/EmailTemplate';

import { EmailTemplateType } from '../types/EmailTemplateType';
import { Locale } from '../types/Locale';

export async function initializeEmailTemplates() {
  const signatureDef = new EmailTemplate();
  signatureDef.key = EmailTemplateType.Signature;
  signatureDef.locale = Locale.English;

  const signUpEmailDef = new EmailTemplate();
  signUpEmailDef.key = EmailTemplateType.SignUp;
  signUpEmailDef.locale = Locale.English;
  signUpEmailDef.vars = ['website', 'email', 'url'];

  const resetPasswordEmailDef = new EmailTemplate();
  resetPasswordEmailDef.key = EmailTemplateType.ResetPassword;
  resetPasswordEmailDef.locale = Locale.English;
  resetPasswordEmailDef.vars = ['website', 'toWhom', 'url'];

  const inviteUserEmailDef = new EmailTemplate();
  inviteUserEmailDef.key = EmailTemplateType.InviteUser;
  inviteUserEmailDef.locale = Locale.English;
  inviteUserEmailDef.vars = ['website', 'toWhom', 'email', 'url'];

  const googleSsoWelcomeEmailDef = new EmailTemplate();
  googleSsoWelcomeEmailDef.key = EmailTemplateType.GoogleSsoWelcome;
  googleSsoWelcomeEmailDef.locale = Locale.English;
  googleSsoWelcomeEmailDef.vars = ['website', 'toWhom'];

  const deleteUserEmailDef = new EmailTemplate();
  deleteUserEmailDef.key = EmailTemplateType.DeleteUser;
  deleteUserEmailDef.locale = Locale.English;
  deleteUserEmailDef.vars = ['website', 'toWhom', 'email'];

  const contactEmailDef = new EmailTemplate();
  contactEmailDef.key = EmailTemplateType.Contact;
  contactEmailDef.locale = Locale.English;
  contactEmailDef.vars = ['website', 'name', 'contact', 'message'];

  const commissionWithdrawalSubmittedEmailDef = new EmailTemplate();
  commissionWithdrawalSubmittedEmailDef.key = EmailTemplateType.CommissionWithdrawalSubmitted;
  commissionWithdrawalSubmittedEmailDef.locale = Locale.English;
  commissionWithdrawalSubmittedEmailDef.vars = ['website', 'toWhom', 'referenceId'];

  const commissionWithdrawalCompletedEmailDef = new EmailTemplate();
  commissionWithdrawalCompletedEmailDef.key = EmailTemplateType.CommissionWithdrawalCompleted;
  commissionWithdrawalCompletedEmailDef.locale = Locale.English;
  commissionWithdrawalCompletedEmailDef.vars = ['website', 'toWhom', 'referenceId', 'comment'];

  const commissionWithdrawalRejectedEmailDef = new EmailTemplate();
  commissionWithdrawalRejectedEmailDef.key = EmailTemplateType.CommissionWithdrawalRejected;
  commissionWithdrawalRejectedEmailDef.locale = Locale.English;
  commissionWithdrawalRejectedEmailDef.vars = ['website', 'toWhom', 'referenceId', 'comment'];

  const WatchlistInsiderTransactionChangedEmailDef = new EmailTemplate();
  WatchlistInsiderTransactionChangedEmailDef.key = EmailTemplateType.WatchlistInsiderTransactionChangedEmail;
  WatchlistInsiderTransactionChangedEmailDef.locale = Locale.English;
  WatchlistInsiderTransactionChangedEmailDef.vars = ['website', 'toWhom', 'symbol'];

  const WatchlistFairValueChangedEmaillDef = new EmailTemplate();
  WatchlistFairValueChangedEmaillDef.key = EmailTemplateType.WatchlistFairValueChangedEmail;
  WatchlistFairValueChangedEmaillDef.locale = Locale.English;
  WatchlistFairValueChangedEmaillDef.vars = ['website', 'toWhom', 'symbol'];

  const WatchlistSupportResistanceChangedEmailDef = new EmailTemplate();
  WatchlistSupportResistanceChangedEmailDef.key = EmailTemplateType.WatchlistSupportResistanceChangedEmail;
  WatchlistSupportResistanceChangedEmailDef.locale = Locale.English;
  WatchlistSupportResistanceChangedEmailDef.vars = ['website', 'toWhom', 'symbol'];

  const SubscriptionExpiredDef = new EmailTemplate();
  SubscriptionExpiredDef.key = EmailTemplateType.SubscriptionExpired;
  SubscriptionExpiredDef.locale = Locale.English;
  SubscriptionExpiredDef.vars = ['website', 'toWhom', 'subscriptionId', 'subscriptionType', 'start', 'end'];

  const SubscriptionExpiringDef = new EmailTemplate();
  SubscriptionExpiringDef.key = EmailTemplateType.SubscriptionExpiring;
  SubscriptionExpiringDef.locale = Locale.English;
  SubscriptionExpiringDef.vars = ['website', 'toWhom', 'subscriptionId', 'subscriptionType', 'start', 'end'];

  const SubscriptionAutoRenewingDef = new EmailTemplate();
  SubscriptionAutoRenewingDef.key = EmailTemplateType.SubscriptionAutoRenewing;
  SubscriptionAutoRenewingDef.locale = Locale.English;
  SubscriptionAutoRenewingDef.vars = ['website', 'toWhom', 'subscriptionId', 'subscriptionType', 'start', 'end'];

  const SubscriptionRecurringAutoPaySucceededDef = new EmailTemplate();
  SubscriptionRecurringAutoPaySucceededDef.key = EmailTemplateType.SubscriptionRecurringAutoPaySucceeded;
  SubscriptionRecurringAutoPaySucceededDef.locale = Locale.English;
  SubscriptionRecurringAutoPaySucceededDef.vars = ['website', 'toWhom', 'subscriptionId', 'subscriptionType', 'start', 'end', 'paidAmount', 'creditDeduction'];

  const SubscriptionRecurringAutoPayFailedDef = new EmailTemplate();
  SubscriptionRecurringAutoPayFailedDef.key = EmailTemplateType.SubscriptionRecurringAutoPayFailed;
  SubscriptionRecurringAutoPayFailedDef.locale = Locale.English;
  SubscriptionRecurringAutoPayFailedDef.vars = ['website', 'toWhom', 'subscriptionId', 'subscriptionType', 'start', 'end', 'paidAmount', 'creditDeduction'];

  const SubscriptionTerminatedDef = new EmailTemplate();
  SubscriptionTerminatedDef.key = EmailTemplateType.SubscriptionTerminated;
  SubscriptionTerminatedDef.locale = Locale.English;
  SubscriptionTerminatedDef.vars = ['website', 'toWhom', 'subscriptionId', 'subscriptionType', 'start', 'end'];


  const entities = [
    signatureDef,
    signUpEmailDef,
    resetPasswordEmailDef,
    inviteUserEmailDef,
    googleSsoWelcomeEmailDef,
    deleteUserEmailDef,
    contactEmailDef,
    commissionWithdrawalSubmittedEmailDef,
    commissionWithdrawalCompletedEmailDef,
    commissionWithdrawalRejectedEmailDef,
    WatchlistInsiderTransactionChangedEmailDef,
    WatchlistFairValueChangedEmaillDef,
    WatchlistSupportResistanceChangedEmailDef,
    SubscriptionExpiredDef,
    SubscriptionExpiringDef,
    SubscriptionAutoRenewingDef,
    SubscriptionRecurringAutoPaySucceededDef,
    SubscriptionRecurringAutoPayFailedDef,
    SubscriptionTerminatedDef,
  ];

  await getManager()
    .createQueryBuilder()
    .insert()
    .into(EmailTemplate)
    .values(entities)
    .orIgnore()
    .execute();
}
