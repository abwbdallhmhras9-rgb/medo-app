import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { Profile } from '@/types';
import { toast } from 'sonner';

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const docRef = doc(db, 'profiles', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Profile;
    }
    return null;
  } catch (error) {
    console.error('فشل في جلب بيانات الملف الشخصي:', error);
    return null;
  }
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithUsername: (username: string, password: string) => Promise<{ error: any }>;
  signUpWithUsername: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    const profileData = await getProfile(user.uid);
    setProfile(profileData);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const profileData = await getProfile(currentUser.uid);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithUsername = async (username: string, password: string) => {
    try {
      const email = `${username}@miaoda.com`;
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      toast.error(`فشل تسجيل الدخول: ${error.message}`);
      return { error };
    }
  };

  const signUpWithUsername = async (username: string, password: string) => {
    try {
      // Validate username: Only letters, digits, and _ are allowed
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new Error('اسم المستخدم يمكن أن يحتوي فقط على أحرف وأرقام وشرطة سفلية');
      }

      const email = `${username}@miaoda.com`;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Create profile in Firestore
      const newProfile: Profile = {
        id: newUser.uid,
        username,
        email,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        bio: '',
        role: 'user',
        created_at: new Date().toISOString()
      };

      await setDoc(doc(db, 'profiles', newUser.uid), newProfile);
      setProfile(newProfile);

      return { error: null };
    } catch (error: any) {
      toast.error(`فشل التسجيل: ${error.message}`);
      return { error };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithUsername, signUpWithUsername, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
