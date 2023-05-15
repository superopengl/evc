export const isProfileComplete = (user) => {
  return true || user.givenName && user.surname && user.country && user.language;
}