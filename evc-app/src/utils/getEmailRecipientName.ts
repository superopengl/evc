
export function getEmailRecipientName(info: { givenName: string, surname: string }) {
  const { givenName, surname } = info;
  const name = `${givenName || ''} ${surname || ''}`.trim();
  return name || 'Client';
}