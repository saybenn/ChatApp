const getNonRegisteredUsers = (usersSnapshot, filterUsers) => {
  //Get All Registered User Emails
  let registeredUsersEmail = usersSnapshot?.docs.map((doc) => doc.data().email);

  //Get Non Registered User Emails
  let nonRegis = filterUsers.filter(
    (email) => !registeredUsersEmail.includes(email)
  );

  return nonRegis;
};

export default getNonRegisteredUsers;
