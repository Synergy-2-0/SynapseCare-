import "@fontsource/source-sans-3";
import "../globals.css";
import React from "react";
import Head from "next/head";
import { AuthProvider } from "../context/AuthContext";
import { DoctorProvider } from "../context/DoctorContext";
import { ToastProvider } from "../context/ToastContext";
import { MockDataProvider } from "../context/MockDataContext";
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
        <MockDataProvider>
          <ToastProvider>
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
          </ToastProvider>
        </MockDataProvider>
      </DoctorProvider>
    </AuthProvider>
  );
}

export default MyApp;
