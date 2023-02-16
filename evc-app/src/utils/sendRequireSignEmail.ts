import { getRepository } from 'typeorm';
import { Task } from '../entity/Task';
import { User } from '../entity/User';
import { sendEmail } from '../services/emailService';
import { getEmailRecipientName } from './getEmailRecipientName';


export async function sendRequireSignEmail(task: Task) {
  const user = await getRepository(User).findOne(task.userId);
  const { id: taskId, name: taskName, forWhom } = task;

  await sendEmail({
    to: user.email,
    template: 'taskToSign',
    vars: {
      toWhom: getEmailRecipientName(user),
      forWhom,
      taskId,
      taskName,
    },
    shouldBcc: true
  });
}
