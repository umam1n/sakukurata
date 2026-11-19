import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../services/firebase';

const AuthContext = createContext();

const GUEST_STORAGE_KEY = 'sakukurata_guest_mode';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem(GUEST_STORAGE_KEY) === 'true');
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setIsGuest(false);
        localStorage.removeItem(GUEST_STORAGE_KEY);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email, password) => {
    setAuthError('');
    if (!auth) throw new Error('Firebase belum dikonfigurasi.');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setAuthError(mapFirebaseAuthError(err.code));
      throw err;
    }
  };

  const registerWithEmail = async (email, password, displayName) => {
    setAuthError('');
    if (!auth) throw new Error('Firebase belum dikonfigurasi.');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName?.trim()) {
        await updateFirebaseProfile(cred.user, { displayName: displayName.trim() });
      }
      return cred.user;
    } catch (err) {
      setAuthError(mapFirebaseAuthError(err.code));
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setAuthError('');
    if (!auth || !googleProvider) throw new Error('Firebase belum dikonfigurasi.');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setAuthError(mapFirebaseAuthError(err.code));
      }
      throw err;
    }
  };

  const continueAsGuest = () => {
    setAuthError('');
    setIsGuest(true);
    localStorage.setItem(GUEST_STORAGE_KEY, 'true');
  };

  const logout = async () => {
    setAuthError('');
    if (isGuest) {
      setIsGuest(false);
      localStorage.removeItem(GUEST_STORAGE_KEY);
      return;
    }
    if (auth) {
      await signOut(auth);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        isAuthenticated: Boolean(user || isGuest),
        isFirebaseConfigured,
        loading,
        authError,
        setAuthError,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        continueAsGuest,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

function mapFirebaseAuthError(code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/operation-not-allowed':
      return 'Sign-in method is not enabled in Firebase Console (Authentication -> Sign-in method).';
    case 'auth/unauthorized-domain':
      return 'This Vercel domain is not authorized in Firebase Console (Authentication -> Settings -> Authorized domains).';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    default:
      return `Authentication failed (${code || 'unknown'}). Please try again.`;
  }
}

export const useAuth = () => useContext(AuthContext);
