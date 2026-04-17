import "@fontsource/open-sans";
import "@fontsource/open-sans/700.css";
import "@fontsource/open-sans/800.css";
import "../globals.css";
import React from "react";
import Head from "next/head";
import { AuthProvider } from "../context/AuthContext";
import { DoctorProvider } from "../context/DoctorContext";
import { ToastProvider } from "../context/ToastContext";
import { NotificationProvider } from "../context/NotificationContext";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  return (
    <AuthProvider>
      <Head>
        <title>SynapsCare | Digital Healthcare Infrastructure</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <DoctorProvider>
        <ToastProvider>
          <NotificationProvider>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={router.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="h-full w-full"
              >
                <Component {...pageProps} />
              </motion.div>
            </AnimatePresence>
          </NotificationProvider>
        </ToastProvider>
      </DoctorProvider>
    </AuthProvider>
  );
}

export default MyApp;
