import React from "react";
import Head from "next/head";
import ChatSlide from "../../components/ChatSlide";
import Sidebar from "../../components/Sidebar";
import styles from "../../styles/ChatApp.module.scss";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { database } from "../../firebaseConfig";

const Chat = ({ data, chat, messages }) => {
  //format data
  let rawMessage = JSON.parse(messages);
  let chatInfo = JSON.parse(chat);
  return (
    <div className={styles.chatScreen}>
      <Head>
        <title>{`Chat App ${chatInfo.emails.filter(
          (users) => users !== data.user.email
        )}`}</title>

        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Sidebar user={data.user} />
      <ChatSlide
        key={chat.id}
        chat={chatInfo}
        messages={rawMessage}
        user={data.user}
      />
    </div>
  );
};

export default Chat;
export async function getServerSideProps(context) {
  //Get Messages
  const messagesRef = collection(
    database,
    "chats",
    context.query.id,
    "messages"
  );

  const q = query(messagesRef, orderBy("timestamp", "asc"));
  const messagesRes = await getDocs(q);

  const messages = messagesRes.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .map((message) => ({
      ...message,
      timestamp: message.timestamp.toDate().getTime(),
    }));

  //Get Chat
  const chatRef = doc(database, "chats", context.query.id);
  const chatRes = await getDoc(chatRef);

  const chat = {
    id: chatRes.id,
    ...chatRes.data(),
  };

  //Get user
  const data = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  return {
    props: {
      data,
      messages: JSON.stringify(messages),
      chat: JSON.stringify(chat),
    },
  };
}
