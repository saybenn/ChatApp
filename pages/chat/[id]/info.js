import React from "react";
import Head from "next/head";
import styles from "../../../styles/ChatApp.module.scss";
import { database, storage } from "../../../firebaseConfig";
import { authOptions } from "../../api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth/next";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { Avatar, AvatarGroup } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useState } from "react";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import chatAlreadyExists from "../../../utils/chatAlreadyExists";
import * as EmailValidator from "email-validator";
import getRegisteredUsers from "../../../utils/getRegisteredUser";
import getNonRegisteredUsers from "../../../utils/getNonRegisteredUser";
import { useRouter } from "next/router";
import ChatParticipants from "../../../components/ChatParticipants";

const Info = ({ data, rawChat }) => {
  //Utils
  const chat = JSON.parse(rawChat);
  const { user } = data;
  const router = useRouter();
  //State
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [groupName, setGroupName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [show, setShow] = useState(false);
  const [picOpt, setPicOpt] = useState(false);
  const [addOpt, setAddOpt] = useState(false);
  const [nameOpt, setNameOpt] = useState(false);
  const [leaveOpt, setLeaveOpt] = useState(false);
  const [removeOpt, setRemoveOpt] = useState(false);
  const [removeUser, setRemoveUser] = useState(false);

  //Refs
  const chatRef = doc(database, "chats", chat.id);
  const userChatRef = query(
    collection(database, "chats"),
    where("owner", "array-contains", user.email)
  );
  const [chatsSnapshot] = useCollection(userChatRef);
  const usersRef = collection(database, "users");
  const [usersSnapshot, val] = useCollection(usersRef);
  const [value] = useDocument(chatRef);

  //Variables
  const participants = value?.data().users.map((user) => user);
  const userEmails = value?.data().emails.map((email) => email);
  //Functions
  const addGroupPic = (e) => {
    e.preventDefault();
    const file = e.target[0].files[0];
    uploadFiles(file);
  };

  const uploadFiles = (file) => {
    if (!file) return;
    const metadata = {
      contentType: "image/jpeg",
    };
    const storageRef = ref(storage, `/groupPics/${chat.id}`);
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
        getDownloadURL(uploadTask.snapshot.ref).then((url) =>
          updateDoc(
            chatRef,
            {
              image: url,
            },
            { merge: true }
          )
        );
      }
    );
  };

  const addUser = async (e) => {
    e.preventDefault();
    let chatters = userEmails.map((emails) => emails);
    chatters.push(userEmail);
    if (
      EmailValidator.validate(userEmail) &&
      userEmail !== user.email &&
      !chatAlreadyExists(chatsSnapshot, chatters) &&
      !userEmails.includes(userEmail)
    ) {
      let registeredUserData = getRegisteredUsers(usersSnapshot, chatters);
      let nonRegis = getNonRegisteredUsers(usersSnapshot, chatters);
      let registeredEmails = registeredUserData.map(
        (regisData) => regisData.email
      );

      let chatUsers = registeredUserData.concat(nonRegis);
      let emails = registeredEmails.concat(nonRegis);
      await updateDoc(
        chatRef,
        {
          owner: registeredEmails,
          users: chatUsers,
          emails,
        },
        { merge: true }
      );
      setUserEmail("");
      handleShow();
    } else {
      setMessage(
        `Group already exists, email format incorrect or user is already in chat.`
      );
      setTimeout(() => {
        setMessage("");
      }, "3000");
      return;
    }
  };

  const removeUserPrep = (email) => {
    setRemoveOpt(true);
    setRemoveUser(email);
  };

  const removeUserFinish = async () => {
    const owner = value.data().owner.filter((owner) => owner !== removeUser);
    const users = participants.filter(
      (participant) =>
        participant.email !== removeUser && participant !== removeUser
    );
    const emails = userEmails.filter((email) => email !== removeUser);
    updateDoc(
      chatRef,
      {
        owner,
        users,
        emails,
      },
      { merge: true }
    );
    handleShow();
  };

  const addGroupName = () => {
    if (!groupName) return;
    updateDoc(
      chatRef,
      {
        name: groupName,
      },
      { merge: true }
    );
    setGroupName("");
  };

  const leaveChat = async () => {
    window.confirm(
      "Are you sure you want to leave the chat? Your messages will still remain."
    );
    const owner = value.data().owner.filter((owner) => owner !== user.email);
    const users = participants.filter(
      (participant) => participant.email !== user.email
    );
    const emails = userEmails.filter((email) => email !== user.email);
    updateDoc(
      chatRef,
      {
        owner,
        users,
        emails,
      },
      { merge: true }
    );
    router.push("/");
  };

  const deleteChat = async () => {
    window.confirm(
      "Are you sure you want to delete the chat? This is an irreversible action."
    );
    await deleteDoc(chatRef);
  };

  const getParticipants = () => {
    if (value) {
      return value.data().users.map((participant) => {
        return (
          <ChatParticipants
            key={participant.email ? participant.email : participant}
            participant={participant}
            removeUserPrep={removeUserPrep}
            handleShow={handleShow}
            setRemoveOpt={setRemoveOpt}
            user={user}
          />
        );
      });
    }
  };

  const handleShow = () => {
    if (show) {
      setShow(false);
      setPicOpt(false);
      setAddOpt(false);
      setNameOpt(false);
      setLeaveOpt(false);
      setRemoveOpt(false);
    } else {
      setShow(true);
    }
  };

  const backToChat = () => {
    router.push(`/chat/${router.query.id}`);
  };

  return (
    <div className={styles.info}>
      <Head>
        <title>{`${
          chat.name
            ? chat.name + " ChatApp Group Info"
            : "ChatApp Group Info " + userEmails
        }`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.infoHead}>
        <div className={styles.infoHeadTop}>
          <ArrowBackIosNewIcon
            sx={{ width: 35, height: 35 }}
            onClick={backToChat}
            className={styles.backArrow}
          />
          <div className={styles.groupDetails}>
            {chat.image ? (
              <Avatar
                className={styles.chatAvatar}
                sx={{ width: 70, height: 70 }}
                src={chat.image}
              ></Avatar>
            ) : participants ? (
              <AvatarGroup spacing="small" max={3}>
                {participants.map((participant) => (
                  <Avatar
                    key={participant.name}
                    sx={{ width: 56, height: 56 }}
                    src={participant.photoURL}
                  ></Avatar>
                ))}
              </AvatarGroup>
            ) : (
              <AvatarGroup spacing="small" max={3}>
                {userEmails &&
                  userEmails.map((email) => (
                    <Avatar key={email} sx={{ width: 56, height: 56 }}>
                      {email[0]}
                    </Avatar>
                  ))}
              </AvatarGroup>
            )}
            {chat.name && <p className={styles.chatName}>{chat.name}</p>}
            <p className={styles.memberCount}>
              {userEmails && userEmails.length} Members
            </p>
          </div>
        </div>
        <div
          onClick={() => {
            handleShow();
            setPicOpt(true);
          }}
          className={styles.infoHeadBottom}
        >
          {userEmails && userEmails.length > 2 && (
            <div className={styles.infoHeadBottomIconGroup}>
              {" "}
              <CameraAltIcon sx={{ width: 60, height: 60 }} /> <p>Group Pic</p>
            </div>
          )}
          {userEmails && userEmails.length > 2 && (
            <div
              onClick={() => {
                handleShow();
                setNameOpt(true);
              }}
              className={styles.infoHeadBottomIconGroup}
            >
              {" "}
              <PeopleAltIcon sx={{ width: 60, height: 60 }} />
              <p>Group Name</p>
            </div>
          )}
          <div
            onClick={() => {
              handleShow();
              setAddOpt(true);
            }}
            className={styles.infoHeadBottomIconGroup}
          >
            <PersonAddIcon sx={{ width: 60, height: 60 }} />
            <p>Add User</p>
          </div>
          <div
            onClick={() => {
              handleShow();
              setLeaveOpt(true);
            }}
            className={styles.infoHeadBottomIconGroup}
          >
            <SettingsApplicationsIcon sx={{ width: 60, height: 60 }} />
            <p>Leave/Delete</p>
          </div>
        </div>
      </div>
      <div className={styles.chatParticipants}>
        {/* Map Chat/Group Member Component */}
        {getParticipants()}
      </div>

      {show && (
        <div className={styles.modal}>
          {picOpt && (
            <div className={styles.modalBody}>
              {message && <p className={styles.error}>{message}</p>}

              <form onSubmit={addGroupPic}>
                <input type="file" />
                <button type="submit">Upload</button>{" "}
              </form>
              <h3>Uploaded {progress}%</h3>
              {progress == 100 && (
                <h3 className={styles.success}>Upload Successful!</h3>
              )}
            </div>
          )}
          {nameOpt && (
            <div className={styles.modalBody}>
              {message && <p className={styles.error}>{message}</p>}
              <form onSubmit={addGroupName}>
                <input
                  onChange={(e) => setGroupName(e.target.value)}
                  value={groupName}
                  placeholder=" Enter group name"
                  type="text"
                />
                <button type="submit">Submit</button>
              </form>
            </div>
          )}
          {addOpt && (
            <div className={styles.modalBody}>
              {message && <p className={styles.error}>{message}</p>}
              <form onSubmit={addUser}>
                <input
                  onChange={(e) => setUserEmail(e.target.value)}
                  value={userEmail}
                  placeholder=" Add new user"
                  type="text"
                />
                <button type="submit">Submit</button>
              </form>
            </div>
          )}
          {leaveOpt && (
            <div className={styles.modalBody}>
              {message && <p className={styles.error}>{message}</p>}

              <button onClick={leaveChat}>Leave Chat</button>
              <button onClick={deleteChat}>Delete Chat</button>
            </div>
          )}
          {removeOpt && (
            <div className={styles.modalBody}>
              {message && <p className={styles.error}>{message}</p>}
              <button onClick={removeUserFinish}>
                Remove {removeUser} from the chat.
              </button>
            </div>
          )}
          <div onClick={handleShow} className={styles.modalOverlay}></div>
        </div>
      )}
    </div>
  );
};

export default Info;
export async function getServerSideProps(context) {
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
      rawChat: JSON.stringify(chat),
    },
  };
}
