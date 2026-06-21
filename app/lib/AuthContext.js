"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

const AuthContext = createContext({
  user: null,
  login: () => {},
  signUp: () => {},
  googleLogin: () => {},
  logout: () => {},
  isAuthenticated: false,
  loading: true,
  loginError: "",
  setLoginError: () => {},
});

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [loginError, setLoginError] = useState("");

  const user = session?.user
    ? {
        uid: session.user.id || session.user.email,
        email: session.user.email,
        name: session.user.name || session.user.email?.split("@")[0],
        photoURL: session.user.image || null,
        credits: 1250,
        plan: "Pro Plan",
        memberSince: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      }
    : null;

  const login = async (email, password) => {
    setLoginError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setLoginError("Account not found. Please sign up.");
      return false;
    }
    return true;
  };

  const signUp = async (name, email, password) => {
    setLoginError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setLoginError(result.error);
      return false;
    }
    return true;
  };

  const googleLogin = async () => {
    setLoginError("");
    await signIn("google", { redirect: false });
    return true;
  };

  const logout = async () => {
    await signOut({ redirect: false });
  };

  return (
    <AuthContext.Provider value={{
      user, login, signUp, googleLogin, logout,
      isAuthenticated: status === "authenticated",
      loading: status === "loading",
      loginError, setLoginError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
