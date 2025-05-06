import { EmailSentOutTask } from './../EmailSentOutTask';
import { ViewEntity, Connection, ViewColumn, PrimaryColumn } from 'typeorm';
import { SubscriptionType } from '../../types/SubscriptionType';
import { UserAliveSubscriptionSummary } from './UserAliveSubscriptionSummary';
import { EmailTemplateType } from '../../types/EmailTemplateType';

@ViewEntity({
  expression: (connection: Connection) => connection.createQueryBuilder()
  .from(UserAliveSubscriptionSummary, 's')
  .leftJoin(q => q.from(EmailSentOutTask, 'm')
    .where(`m.template IN ('${EmailTemplateType.SubscriptionExpiring}', '${EmailTemplateType.SubscriptionAutoRenewing}')`)
    .andWhere(`CURRENT_DATE - m."sentAt" <= interval '30 days'`),
    'm', `m.vars->>'subscriptionId' = s."currentSubscriptionId"::text`)
// .where(`s."end" - CURRENT_DATE = 7`)
// .andWhere(`m."sentAt" IS NULL`)
  .select([
    's."currentSubscriptionId" as "subscriptionId"',
    's."userId" as "userId"',
    's."email" as "email"',
    's."givenName" as "givenName"',
    's."surname" as "surname"',
    's.start as start',
    's.end as end',
    's."currentType" as type',
    's."lastRecurring" as "recurring"',
    's."end" - CURRENT_DATE as "daysBeforeEnd"',
    'm.template as "sentNotificationTemplate"',
    'EXTRACT(DAY FROM s."end" - m."sentAt") as "sentDaysBeforeEnd"',
    'm."sentAt"',
    ])
  })
export class SubscriptionEndingNotificationEmailInformation {
  @ViewColumn()
  @PrimaryColumn()
  subscriptionId: string;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  givenName: string;

  @ViewColumn()
  surname: string;

  @ViewColumn()
  start: Date;

  @ViewColumn()
  end: Date;

  @ViewColumn()
  type: SubscriptionType;

  @ViewColumn()
  recurring: boolean;

  @ViewColumn()
  daysBeforeEnd: number;

  @ViewColumn()
  sentNotificationTemplate: EmailTemplateType.SubscriptionExpiring | EmailTemplateType.SubscriptionAutoRenewing;

  @ViewColumn()
  sentDaysBeforeEnd: number;

  @ViewColumn()
  sentAt: Date;
}
