export const isProfileComplete = (user) => {
  return user.givenName && user.surname && user.country && user.locale;
}