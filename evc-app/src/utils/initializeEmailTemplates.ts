import { EmailTemplate } from "../entity/EmailTemplate";
import { getManager } from 'typeorm';
import { EmailTemplateType } from "../types/EmailTemplateType";
import { Locale } from '../types/Locale';

export async function initializeEmailTemplates() {

  const SignUpEmailDef = new EmailTemplate();
  SignUpEmailDef.key = EmailTemplateType.SignUp;
  SignUpEmailDef.locale = Locale.Engish;
  SignUpEmailDef.vars = ['website', 'email', 'url'];

  const ResetPasswordEmailDef = new EmailTemplate();
  ResetPasswordEmailDef.key = EmailTemplateType.ResetPassword;
  ResetPasswordEmailDef.locale = Locale.Engish;
  ResetPasswordEmailDef.vars = ['website', 'toWhom', 'url'];

  const InviteUserEmailDef = new EmailTemplate();
  InviteUserEmailDef.key = EmailTemplateType.InviteUser;
  InviteUserEmailDef.locale = Locale.Engish;
  InviteUserEmailDef.vars = ['website', 'toWhom', 'email', 'url'];

  const GoogleSsoWelcomeEmailDef = new EmailTemplate();
  GoogleSsoWelcomeEmailDef.key = EmailTemplateType.GoogleSsoWelcome;
  GoogleSsoWelcomeEmailDef.locale = Locale.Engish;
  GoogleSsoWelcomeEmailDef.vars = ['website', 'toWhom'];

  const DeleteUserEmailDef = new EmailTemplate();
  DeleteUserEmailDef.key = EmailTemplateType.DeleteUser;
  DeleteUserEmailDef.locale = Locale.Engish;
  DeleteUserEmailDef.vars = ['website', 'toWhom'];

  const ContactEmailDef = new EmailTemplate();
  ContactEmailDef.key = EmailTemplateType.Contact;
  ContactEmailDef.locale = Locale.Engish;
  ContactEmailDef.vars = ['website', 'name', 'contact', 'message'];

  const entities = [
    SignUpEmailDef,
    ResetPasswordEmailDef,
    InviteUserEmailDef,
    GoogleSsoWelcomeEmailDef,
    DeleteUserEmailDef,
    ContactEmailDef
  ];

  await getManager()
    .createQueryBuilder()
    .insert()
    .into(EmailTemplate)
    .values(entities)
    .onConflict(`(key, locale) DO NOTHING`)
    .execute();
}
