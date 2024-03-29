import { getManager } from 'typeorm';
import { Config } from '../entity/Config';

export async function initializeConfig() {
  const noreply = new Config();
  noreply.key = 'email.sender.noreply';
  noreply.value = 'noreply@easyvaluecheck.com';

  const contacat = new Config();
  contacat.key = 'email.contact.recipient';
  contacat.value = 'contact@easyvaluecheck.com';

  const bcc = new Config();
  bcc.key = 'email.sender.bcc';
  bcc.value = 'admin@easyvaluecheck.com';

  const entities = [
    noreply,
    contacat,
    bcc
  ];

  await getManager()
    .createQueryBuilder()
    .insert()
    .into(Config)
    .values(entities)
    .orIgnore()
    .execute();
}

