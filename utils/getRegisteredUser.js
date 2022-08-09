const getRegisteredUsers = (usersSnapshot, filterUsers) => {
  //Get All Registered User Emails
  let registeredUsersEmail = usersSnapshot?.docs.map((doc) => doc.data().email);
  //Return user emails that are found in registrar
  let regis = filterUsers.filter((email) =>
    registeredUsersEmail.includes(email)
  );

  //Return snapshot(data from registrar) of verified emails
  let regisSnap = usersSnapshot.docs.filter((snapshot) =>
    regis.includes(snapshot.data().email)
  );

  //Format data from registrar
  let registeredUsers = regisSnap.map((regisData) => regisData.data());

  return registeredUsers;
};

export default getRegisteredUsers;
