import React from "react";
import styles from "../styles/ChatApp.module.scss";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import GroupIcon from "@mui/icons-material/Group";
import { Avatar } from "@material-ui/core";
import { useRouter } from "next/router";

const ChatFriends = ({
  image,
  name,
  lastMessage,
  lastActive,
  users,
  user,
  id,
  participants,
}) => {
  //State and Variables
  const router = useRouter();

  //More than 2 recipients
  const recipients = participants.filter(
    (participant) => participant !== user.email
  );

  // //1 on 1 Chat, other user
  const recipient = participants.filter((partic) => partic !== user.email)[0];

  //1 on 1 Chat, recipient details
  const recipientData = users.filter((user) => user.email === recipient)[0];

  //Functions
  const enterChat = () => {
    router.push(`/chat/${id}`);
  };

  return (
    <div onClick={enterChat} className={styles.chatFriend}>
      {image != undefined ? (
        <Avatar src={image} alt={name} className={styles.chatFriendPhoto} />
      ) : recipientData && recipients.length < 2 ? (
        <Avatar
          src={recipientData.photoURL}
          alt={recipientData.name}
          className={styles.chatFriendPhoto}
        />
      ) : !recipientData && recipients.length < 2 ? (
        <Avatar className={styles.chatFriendPhoto}>
          {recipients[0][0].toUpperCase()}
        </Avatar>
      ) : (
        <Avatar className={styles.chatFriendPhoto}>
          <GroupIcon />
        </Avatar>
      )}

      <div className={styles.chatFriendPreview}>
        <p className={styles.bold}>
          {name
            ? name
            : recipients.length > 1
            ? recipients.join(", ")
            : recipientData
            ? recipientData.name
            : recipient}
        </p>
        <span className={styles.accent}>
          {lastMessage ? (
            lastMessage.sender == user.name ? (
              "You:"
            ) : (
              `${lastMessage.sender}:`
            )
          ) : (
            <></>
          )}
        </span>{" "}
        <span className={styles.mute}>
          {lastMessage ? lastMessage.message : "Send the first message!"}
        </span>
      </div>
      <div className={styles.chatFriendMinor}>
        <p>
          {lastActive
            ? new Date(lastActive.seconds * 1000).toLocaleDateString()
            : "-"}
        </p>
        <MoreHorizIcon className={styles.chatFriendSettings} />
      </div>
    </div>
  );
};

export default ChatFriends;
