
export function getEmailRecipientName(user) {
  const { givenName, surname } = user.profile;
  const name = `${givenName || ''} ${surname || ''}`.trim();
  return name || 'Client';
}
