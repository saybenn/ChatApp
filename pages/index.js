import Head from "next/head";
import styles from "../styles/ChatApp.module.scss";
import { unstable_getServerSession } from "next-auth/next";
import Sidebar from "../components/Sidebar";
import { useSession } from "next-auth/react";
import { collection, query, where } from "firebase/firestore";
import { auth, database } from "../firebaseConfig";
import { useEffect, useState } from "react";
import { authOptions } from "./api/auth/[...nextauth]";
import { useRouter } from "next/router";
import BlankSlide from "../components/BlankSlide";

export default function Home({ data }) {
  const router = useRouter();

  if (!data.user) {
    router.push("/login");
  } else {
    return (
      <div className={styles.container}>
        <Head>
          <title>Chat App</title>
          <meta name="description" content="Chat App Home" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Sidebar user={data.user} />
        <BlankSlide />
      </div>
    );
  }
}

export async function getServerSideProps({ req, res }) {
  const data = await unstable_getServerSession(req, res, authOptions);
  return {
    props: {
      data,
    },
  };
}

