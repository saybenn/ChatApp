import React, { useState } from "react";
import { database } from "../firebaseConfig";
import chatAlreadyExists from "../utils/chatAlreadyExists";
import getRegisteredUsers from "../utils/getRegisteredUser";
import getNonRegisteredUsers from "../utils/getNonRegisteredUser";
import { signOut } from "next-auth/react";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import styles from "../styles/ChatApp.module.scss";
import Avatar from "@mui/material/Avatar";
import ChatFriends from "./ChatFriends";
import * as EmailValidator from "email-validator";
import { useRouter } from "next/router";

const Sidebar = ({ user }) => {
  //State and Variables
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [input, setInput] = useState("");
  const [groupName, setGroupName] = useState("");
  const [message, setMessage] = useState("");

  const chatRef = collection(database, "chats");
  const userChatRef = query(chatRef, orderBy("lastActive", "desc"));

  const [chatsSnapshot, value] = useCollection(userChatRef);
  const usersRef = collection(database, "users");
  const [usersSnapshot, val] = useCollection(usersRef);

  //Functions
  const handleShow = () => {
    if (show) {
      setShow(false);
    } else {
      setShow(true);
    }
  };

  const createChat = async () => {
    if (!input) return null;

    //If multiple email inputs
    if (input.indexOf(",") > -1) {
      //remove whitespace from input
      let trimmed = input.replace(/\s+/g, "");

      //turn input into array
      let multi = trimmed.split(",");

      //Initial checks
      let passed = multi.filter((email) => {
        for (var key in email) {
          if (EmailValidator.validate(email) && email !== user.email) {
            return email;
          } else {
            setMessage(`${email} is not valid input.`);
            setTimeout(() => {
              setMessage("");
            }, "3000");
            return;
          }
        }
      });

      //If emails pass initial check
      if (passed.length > 0) {
        passed.push(user.email);

        //See if Group already exists
        if (chatAlreadyExists(chatsSnapshot, passed) === false) {
          //See if a registered users exists inside group.
          let registeredUserData = getRegisteredUsers(usersSnapshot, passed);

          //See which inputs are non-registered users
          let nonRegis = getNonRegisteredUsers(usersSnapshot, passed);

          //Emails of registered users
          let registeredEmails = registeredUserData.map(
            (regisData) => regisData.email
          );

          let chatUsers = registeredUserData.concat(nonRegis);
          let emails = registeredEmails.concat(nonRegis);

          //Create chat with registered users as joint owners
          addDoc(collection(database, "chats"), {
            owner: registeredEmails,
            users: chatUsers,
            name: groupName,
            emails,
            lastActive: new Date(),
          });
          setInput("");
          setShow(false);
        } else {
          setMessage(`Group already exists or email format incorrect.`);
          setTimeout(() => {
            setMessage("");
          }, "3000");
          return;
        }
      }
    }

    //If single email input
    else {
      let duo = input.split();
      duo.push(user.email);
      if (
        EmailValidator.validate(input) &&
        !chatAlreadyExists(chatsSnapshot, duo) &&
        input !== user.email
      ) {
        //Check if input is registered User
        const usersSnapshot = await getDocs(collection(database, "users"));
        const recip = usersSnapshot.docs.filter(
          (doc) => doc.data().email == input
        );

        //Get user's Snapshot
        const userSnap = usersSnapshot.docs.filter(
          (doc) => doc.data().email == user.email
        );
        const userRef = userSnap[0].data();

        let emails = duo;
        if (recip.length > 0) {
          //Get Registered Input's Snapshot
          const recipient = recip[0].data();

          //Create Chat as joint owners
          let doc = await addDoc(collection(database, "chats"), {
            owner: [user.email, recipient.email],
            users: [recipient, userRef],
            emails,
            lastActive: new Date(),
          });
        } else {
          // Create chat as single owner
          let doc = await addDoc(collection(database, "chats"), {
            owner: [user.email],
            users: [input, userRef],
            emails,
            lastActive: new Date(),
          });
        }
        setInput("");
        setShow(false);
      } else {
        setMessage("Invalid input, try again.");
        setTimeout(() => {
          setMessage("");
        }, "3000");
      }
    }
  };

  return (
    <div className={styles.sideBar}>
      <div className={styles.sideBarHalf}>
        <div className={styles.sideBarTop}>
          {user.image ? (
            <Avatar
              className={[styles.opacHover, styles.userBubble].join(" ")}
              onClick={() =>
                signOut({ callbackUrl: "http://localhost:3000/login" })
              }
              sx={{ width: 60, height: 60 }}
              src={user.image}
            />
          ) : (
            <Avatar
              className={[styles.opacHover, styles.userBubble]}
              onClick={() =>
                signOut({ callbackUrl: "http://localhost:3000/login" })
              }
              sx={{ width: 60, height: 60, fontSize: 50 }}
            >
              {user.email[0].toUpperCase()}
            </Avatar>
          )}
          <div className={styles.userEmail}>{user.email}</div>
        </div>
        <div onClick={handleShow} className={styles.startNewChat}>
          Start New Chat
        </div>
      </div>
      <div className={styles.chatList}>
        {/* Map Chat Friends into ChatFriends Component */}
        {chatsSnapshot ? (
          chatsSnapshot.docs
            .filter((chat) => chat.data().owner.includes(user.email))
            .map((chat) => {
              return (
                <ChatFriends
                  key={chat.id}
                  id={chat.id}
                  users={chat.data().users}
                  participants={chat.data().emails}
                  image={chat.data().image}
                  lastMessage={chat.data().lastMessage}
                  lastActive={chat.data().lastActive}
                  name={chat.data().name}
                  user={user}
                />
              );
            })
        ) : (
          <></>
        )}
      </div>
      {show && (
        <div className={styles.modal}>
          <div className={styles.modalBody}>
            <h2>
              Enter an email address for the user you would like to chat with.
              If making a group, seperate addresses with a &apos,&apos.
            </h2>
            {message && <p className={styles.error}>{message}</p>}
            <input
              placeholder=" Enter email address"
              onChange={(e) => setInput(e.target.value)}
              type="text"
            />
            <input
              placeholder=" Enter Group name"
              onChange={(e) => setGroupName(e.target.value)}
              type="text"
              disabled={input.indexOf(",") < 0}
            />
            <button onClick={createChat}>Start Chat</button>
          </div>
          <div onClick={handleShow} className={styles.modalOverlay}></div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
