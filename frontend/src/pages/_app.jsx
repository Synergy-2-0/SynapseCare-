import "@fontsource/dm-sans";
import "@fontsource/lora";
import "../globals.css";
import React from "react";
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
      <DoctorProvider>
        <MockDataProvider>
          <ToastProvider>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={router.pathname}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
