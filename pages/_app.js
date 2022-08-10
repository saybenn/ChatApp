import "../styles/globals.css";
import { getSession, SessionProvider } from "next-auth/react";
import { database } from "../firebaseConfig";
import { useEffect } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();
  useEffect(() => {
    const getTheSession = async () => {
      const session = await getSession();
      if (session) {
        setDoc(
          doc(database, "users", session.user.name),
          {
            lastSeen: serverTimestamp(),
            email: session.user.email,
            photoURL: session.user.image,
            name: session.user.name,
          },
          {
            merge: true,
          }
        );
      } else {
        router.push("/login");
      }
    };
    getTheSession();
  }, [session]);

  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;

