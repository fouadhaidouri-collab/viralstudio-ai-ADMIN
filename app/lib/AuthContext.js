"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({
  user: null,
  login: () => {},
  signUp: () => {},
  googleLogin: () => {},
  logout: () => {},
  refreshCredits: () => {},
  isAuthenticated: false,
  loading: true,
  loginError: "",
  setLoginError: () => {},
});

function lsUsers() {
  try { return JSON.parse(localStorage.getItem("auth_users") || "{}"); } catch { return {}; }
}

function lsSave(u) { localStorage.setItem("app_user", JSON.stringify(u)); }
function lsGet() {
  try { return JSON.parse(localStorage.getItem("app_user")); } catch { return null; }
}
function lsRemove() { localStorage.removeItem("app_user"); }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    setUser(lsGet());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) lsSave(user);
  }, [user]);

  const refreshCredits = () => {
    fetch("/api/credits").then(r => r.json()).then(d => {
      if (d.balance != null && user) {
        const u = { ...user, credits: d.balance };
        setUser(u);
      }
    }).catch(() => {});
  };

  const signUp = (name, email, password) => {
    setLoginError("");
    const e = email.trim().toLowerCase();
    const users = lsUsers();
    if (users[e]) {
      setLoginError("This email is already registered. Please sign in.");
      return false;
    }
    users[e] = { name, email: e, password, credits: 1250, plan: "Pro Plan", memberSince: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }) };
    localStorage.setItem("auth_users", JSON.stringify(users));
    const u = { ...users[e], password: undefined };
    setUser(u);
    refreshCredits();
    return true;
  };

  const login = (email, password) => {
    setLoginError("");
    const e = email.trim().toLowerCase();
    const users = lsUsers();
    const stored = users[e];
    if (!stored) {
      setLoginError("Account not found. Please sign up.");
      return false;
    }
    if (stored.password !== password) {
      setLoginError("Wrong email or password.");
      return false;
    }
    const u = { ...stored, password: undefined };
    setUser(u);
    refreshCredits();
    return true;
  };

  const googleLogin = () => {
    setLoginError("");
    const u = {
      uid: "google_" + Date.now(),
      email: "google.user@gmail.com",
      name: "Google User",
      photoURL: null,
      credits: 1250,
      plan: "Pro Plan",
      memberSince: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    };
    setUser(u);
    refreshCredits();
    return true;
  };

  const logout = () => {
    setUser(null);
    lsRemove();
  };

  return (
    <AuthContext.Provider value={{
      user, login, signUp, googleLogin, logout, refreshCredits,
      isAuthenticated: !!user,
      loading, loginError, setLoginError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
