const chatAlreadyExists = (chatsSnapshot, recipients) => {
  let isMatch = false;
  !!chatsSnapshot?.docs.forEach((chat) => {
    if (
      isMatch ||
      JSON.stringify(chat.data().emails?.sort()) ===
        JSON.stringify(recipients.sort())
    ) {
      isMatch = true;
    }
  });
  return isMatch;
};

export default chatAlreadyExists;
