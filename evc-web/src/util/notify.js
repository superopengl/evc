// Not antd's static `notification`: that renders in its own root, outside
// <ConfigProvider>, so it loses the theme. See util/antdStatic.
import { notification } from 'util/antdStatic';

function request(level, title, content, duration) {
  const key = `${title}`;
  notification[level]({
    // `title`, not `message`: antd 6 renamed the heading and warns on the old name.
    title,
    description: content,
    key,
    duration: duration || 4,
    placement: 'topLeft',
    style: { width: '85vw', maxWidth: '380px' }
  });

  return {
    close: () => {
      notification.destroy(key);
    }
  }
}

export const notify = {
  error(title, content = null) {
    return request('error', title, content, 6);
  },
  success(title, content = null, duration = 4) {
    return request('success', title, content, duration);
  },
  info(title, content = null, duration = 10) {
    return request('info', title, content, duration);
  },
  warn(title, content = null) {
    // 'warning', not 'warn': the App/hook instance drops the deprecated alias.
    return request('warning', title, content, 5);
  }
}