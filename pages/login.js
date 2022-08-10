import Head from "next/head";
import styles from "../styles/ChatApp.module.scss";
import { signIn } from "next-auth/react";
import Image from "next/image";

const Login = () => {
  return (
    <div className={styles.loginContainer}>
      <Head>
        <title>Login</title>
      </Head>

      <div className={styles.loginBubble}>
        <h1 className={styles.intro}>
          Welcome to <span className={styles.accent}>ChatApp</span>
        </h1>
        <Image
          className={styles.introImg}
          height={125}
          width={125}
          src="https://www.freeiconspng.com/thumbs/live-chat-icon/live-chat-icon-13.png"
          alt="ChatApp Logo"
        />
        <button
          onClick={() =>
            signIn("google", {
              callbackUrl: "http://localhost:3000/",
            })
          }
          className={styles.loginBtn}
        >
          Sign In With Google
        </button>
      </div>
    </div>
  );
};

export default Login;
