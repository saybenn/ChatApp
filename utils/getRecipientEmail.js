const getRecipientEmail = (users, userLoggedIn) => {
  return users.filter((userToFilter) => userToFilter !== userLoggedIn);
};

export default getRecipientEmail;
