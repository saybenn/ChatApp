import React from "react";
import styles from "../styles/ChatApp.module.scss";

const ChatMessages = ({ image, user, sender, timestamp, message, avatar }) => {
  return (
    <div
      className={
        sender === user.name ? styles.messageUser : styles.messageOther
      }
    >
      <img
        className={styles.messageThumbnail}
        src={sender === user.name ? user.image : avatar}
      />
      {/* Message Row */}
      <div>
        {sender === user.name ? (
          <></>
        ) : (
          <p className={styles.sender}>{sender}</p>
        )}
        {/* Meesage Block */}
        <div className={styles.messageContent}>
          <p className={styles.message}>{message}</p>
          {image && <img className={styles.messageImage} src={image} alt="" />}
          <p className={[styles.time]}>
            {new Date(timestamp).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessages;
