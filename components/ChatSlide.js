import React, { useState } from "react";
import styles from "../styles/ChatApp.module.scss";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CheckIcon from "@mui/icons-material/Check";
import ChatMessages from "./ChatMessages";
import { useRouter } from "next/router";
import {
  addDoc,
  collection,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { database, storage } from "../firebaseConfig";
import { Avatar, AvatarGroup } from "@mui/material";
import { useCollection } from "react-firebase-hooks/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const ChatSlide = ({ messages, chat, user }) => {
  //State and Variables
  const [progress, setProgress] = useState(0);
  const [fileInput, setFileInput] = useState("");
  const [rawFile, setRawFile] = useState("");
  const [input, setInput] = useState("");
  const router = useRouter();
  const { id } = router.query;

  const messagesRef = collection(database, "chats", id, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  const [messagesSnapshot] = useCollection(q);

  //More than 2 recipients
  const recipients = chat.emails.filter(
    (participant) => participant !== user.email
  );

  // //1 on 1 Chat, other user
  const recipient = chat.emails.filter((partic) => partic !== user.email)[0];

  //1 on 1 Chat, recipient details
  const recipientData = chat.users.filter(
    (user) => user.email === recipient
  )[0];

  //Functions
  const showMessages = () => {
    if (messagesSnapshot) {
      return messagesSnapshot.docs.map((message) => {
        return (
          <ChatMessages
            user={user}
            key={message.id}
            sender={message.data().sender}
            avatar={message.data().avatar}
            message={message.data().message}
            image={message.data().image}
            timestamp={message.data().timestamp?.toDate().getTime()}
          />
        );
      });
    } else {
      return messages.map((message) => (
        <ChatMessages
          user={user}
          key={message.id}
          sender={message.sender}
          avatar={message.avatar}
          timestamp={message.timestamp.seconds}
          message={message.message}
          image={message.image}
        ></ChatMessages>
      ));
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    // update last seen
    const userRef = doc(database, "users", user.name);
    updateDoc(userRef, {
      lastSeen: serverTimestamp(),
      photoURL: user.image,
    });

    const chatRef = doc(database, "chats", id);
    updateDoc(chatRef, {
      lastActive: serverTimestamp(),
      lastMessage: {
        sender: user.name,
        message: input,
        image: fileInput,
      },
    });

    let docu = await addDoc(messagesRef, {
      timestamp: serverTimestamp(),
      message: input,
      image: fileInput,
      sender: user.name,
      avatar: user.image,
    });

    setInput("");
    setFileInput("");
    setProgress(0);
  };

  const uploadHandler = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const metadata = {
      contentType: "image/jpeg",
    };
    const storageRef = ref(storage, `/chatPics/${id}/${new Date()}`);
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(prog);
      },
      (err) => console.log(err),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setFileInput(url);
        });
      }
    );
    setInput("");
    setProgress(0);
  };

  const leaveChat = () => {
    router.push(`/`);
  };

  const chatInfo = () => {
    router.push(`/chat/${id}/info`);
  };

  return (
    <div className={styles.chatSlide}>
      <div className={styles.chatSlideTop}>
        <ArrowBackIosNewIcon onClick={leaveChat} className={styles.backArrow} />
        <div className={styles.chatMinorInfo}>
          <p className={styles.chatName}>
            {chat.name
              ? chat.name
              : chat.users.length > 2
              ? recipients.map((participant) => participant).join(", ")
              : recipientData
              ? recipientData.name
              : recipient}
          </p>
          <p>
            <span className={styles.muted}>Last Active: </span>
            {chat.users.length > 2 && chat.lastActive
              ? new Date(chat.lastActive.seconds * 1000).toLocaleDateString()
              : recipientData
              ? new Date(
                  recipientData.lastSeen.seconds * 1000
                ).toLocaleDateString()
              : "No Activity"}
          </p>
        </div>
        <div className={styles.chatSlideAvatar}>
          {" "}
          {chat.image != undefined ? (
            <Avatar
              onClick={chatInfo}
              src={chat.image}
              className={styles.chatFriendPhoto}
            />
          ) : recipients.length > 1 ? (
            <AvatarGroup onClick={chatInfo} spacing="small" max={3}>
              {recipients.map((recip) => (
                <Avatar key={recip}>{recip[0]}</Avatar>
              ))}
            </AvatarGroup>
          ) : recipientData ? (
            <Avatar
              onClick={chatInfo}
              src={recipientData.photoURL}
              alt={recipientData.name}
              className={styles.chatFriendPhoto}
            />
          ) : (
            <Avatar onClick={chatInfo} className={styles.chatFriendPhoto}>
              {recipients[0][0].toUpperCase()}
            </Avatar>
          )}
        </div>
      </div>
      <div className={styles.chatLanding}>
        <div>
          {/* Map Chat Messages by Date*/}
          {showMessages()}
        </div>
      </div>
      <div className={styles.messageArea}>
        {/* Input for messaging */}

        <form>
          <label htmlFor="form-input">
            <AttachFileIcon
              className={styles.fileIcon}
              color={"action"}
              sx={{ fontSize: 35 }}
            ></AttachFileIcon>
            {progress == 0 ? (
              <></>
            ) : progress > 0 && progress < 100 ? (
              `${progress}%`
            ) : (
              <CheckIcon
                className={styles.fileIcon}
                sx={{ fontSize: 35 }}
                color={"success"}
              />
            )}
          </label>
          <input onInput={uploadHandler} id="form-input" type="file" />

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            className={styles.messageInput}
            placeholder=" Enter a message..."
          />
          <button
            className={styles.hiddenBtn}
            onClick={sendMessage}
            type="submit"
            disabled={!input}
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatSlide;
