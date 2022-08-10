import Image from "next/image";
import Link from "next/link";
import React from "react";
import styles from "../styles/ChatApp.module.scss";

const ChatMessages = ({ image, user, sender, timestamp, message, avatar }) => {
  return (
    <div
      className={
        sender === user.name ? styles.messageUser : styles.messageOther
      }
    >
      <Image
        alt={sender}
        height={40}
        layout="intrinsic"
        width={40}
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
          {image && (
            <a rel="noreferrer" target="_blank" href={image}>
              <Image
                alt={image}
                layout="fixed"
                quality={100}
                width={150}
                height={150}
                className={styles.messageImage}
                src={image}
              />
            </a>
          )}
          <p className={[styles.time]}>
            {new Date(timestamp).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessages;
