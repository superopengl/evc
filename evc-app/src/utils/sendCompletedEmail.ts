import { getRepository } from 'typeorm';
import { Task } from '../entity/Task';
import { User } from '../entity/User';
import { sendEmail } from '../services/emailService';
import { File } from '../entity/File';
import { getEmailRecipientName } from './getEmailRecipientName';


export async function sendCompletedEmail(task: Task) {
  const user = await getRepository(User).findOne(task.userId);
  const { id: taskId, docs: taskDocs, name: taskName, forWhom } = task;
  const fileIds = (taskDocs || []).filter(d => d.isFeedback).map(d => d.fileId).filter(x => x);
  const attachments = fileIds.length ?
    await getRepository(File)
      .createQueryBuilder('x')
      .where(`x.id IN (:...ids)`, { ids: fileIds })
      .select(['x.fileName as filename', 'x.location as path'])
      .execute() :
    undefined;

  await sendEmail({
    to: user.email,
    template: 'taskComplete',
    vars: {
      toWhom: getEmailRecipientName(user),
      forWhom,
      taskId,
      taskName,
    },
    attachments,
    shouldBcc: true
  });
}
