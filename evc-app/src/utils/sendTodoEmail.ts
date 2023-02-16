import { getRepository } from 'typeorm';
import { Task } from '../entity/Task';
import { User } from '../entity/User';
import { sendEmail } from '../services/emailService';
import { File } from '../entity/File';
import { getEmailRecipientName } from './getEmailRecipientName';

export async function sendTodoEmail(task: Task) {
  const user = await getRepository(User).findOne(task.userId);
  const { id: taskId, name: taskName, forWhom } = task;

  await sendEmail({
    to: user.email,
    template: 'taskTodo',
    vars: {
      toWhom: getEmailRecipientName(user),
      forWhom,
      taskId,
      taskName,
    },
    shouldBcc: true
  });
}
