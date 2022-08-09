import React from "react";
import styles from "../styles/ChatApp.module.scss";
import { Avatar } from "@material-ui/core";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";

const ChatParticipants = ({
  participant,
  handleShow,
  removeUserPrep,
  setRemoveOpt,
  user,
}) => {
  return (
    <div className={styles.chatParticipantsCard}>
      {participant.photoURL ? (
        <Avatar src={participant.photoURL} />
      ) : (
        <Avatar>{participant[0].toUpperCase()}</Avatar>
      )}{" "}
      {participant.name ? <p>{participant.name}</p> : <p>{participant}</p>}
      {participant.email !== user.email && participant.email ? (
        <PersonRemoveIcon
          className={styles.removeIcon}
          onClick={() => {
            handleShow();
            setRemoveOpt(true);
            removeUserPrep(participant.email);
          }}
        />
      ) : !participant.email && participant !== user.email ? (
        <PersonRemoveIcon
          className={styles.removeIcon}
          onClick={() => {
            handleShow();
            setRemoveOpt(true);
            removeUserPrep(participant);
          }}
        />
      ) : (
        <div className={styles.removeIcon}></div>
      )}
    </div>
  );
};

export default ChatParticipants;
