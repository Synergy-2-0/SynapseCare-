import "../globals.css";
import React from "react";
import { AuthProvider } from "../context/AuthContext";
import { DoctorProvider } from "../context/DoctorContext";
import { ToastProvider } from "../context/ToastContext";

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <DoctorProvider>
        <ToastProvider>
          <Component {...pageProps} />
        </ToastProvider>
      </DoctorProvider>
    </AuthProvider>
  );
}

export default MyApp;
