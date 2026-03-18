import { auth, db, storage } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  addDoc, 
  deleteDoc,
  getCountFromServer,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Profile, Video, Comment, Like, Follow } from '@/types';

export const api = {
  // Profiles
  getProfile: async (userId: string) => {
    try {
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { data: docSnap.data() as Profile, error: null };
      }
      return { data: null, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  getProfileByUsername: async (username: string) => {
    try {
      const q = query(collection(db, 'profiles'), where('username', '==', username), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return { data: querySnapshot.docs[0].data() as Profile, error: null };
      }
      return { data: null, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    try {
      const docRef = doc(db, 'profiles', userId);
      await updateDoc(docRef, updates);
      return { data: true, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  // Videos
  getVideos: async (limitNum = 10, lastVideoDoc?: any) => {
    try {
      let q = query(
        collection(db, 'videos'), 
        orderBy('created_at', 'desc'), 
        limit(limitNum)
      );
      
      if (lastVideoDoc) {
        q = query(q, startAfter(lastVideoDoc));
      }

      const querySnapshot = await getDocs(q);
      const videos: Video[] = [];

      for (const videoDoc of querySnapshot.docs) {
        const videoData = videoDoc.data();
        // Fetch profile
        const profileRef = doc(db, 'profiles', videoData.user_id);
        const profileSnap = await getDoc(profileRef);
        const profile = profileSnap.exists() ? (profileSnap.data() as Profile) : undefined;

        // Fetch likes count
        const likesQuery = query(collection(db, 'likes'), where('video_id', '==', videoDoc.id));
        const likesCount = (await getCountFromServer(likesQuery)).data().count;

        // Fetch comments count
        const commentsQuery = query(collection(db, 'comments'), where('video_id', '==', videoDoc.id));
        const commentsCount = (await getCountFromServer(commentsQuery)).data().count;

        videos.push({
          id: videoDoc.id,
          ...videoData,
          profiles: profile,
          likes_count: likesCount,
          comments_count: commentsCount
        } as Video);
      }
      
      return { data: videos, error: null, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
    } catch (error: any) {
      return { data: [], error };
    }
  },

  getUserVideos: async (userId: string) => {
    try {
      const q = query(
        collection(db, 'videos'), 
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const videos: Video[] = [];

      for (const videoDoc of querySnapshot.docs) {
        const videoData = videoDoc.data();
        
        // Fetch likes count
        const likesQuery = query(collection(db, 'likes'), where('video_id', '==', videoDoc.id));
        const likesCount = (await getCountFromServer(likesQuery)).data().count;

        // Fetch comments count
        const commentsQuery = query(collection(db, 'comments'), where('video_id', '==', videoDoc.id));
        const commentsCount = (await getCountFromServer(commentsQuery)).data().count;

        videos.push({
          id: videoDoc.id,
          ...videoData,
          likes_count: likesCount,
          comments_count: commentsCount
        } as Video);
      }
      
      return { data: videos, error: null };
    } catch (error: any) {
      return { data: [], error };
    }
  },

  uploadVideo: async (videoData: Partial<Video>) => {
    try {
      const docRef = await addDoc(collection(db, 'videos'), {
        ...videoData,
        created_at: new Date().toISOString()
      });
      return { data: { id: docRef.id }, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  uploadFile: async (file: File, path: string) => {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return { data: url, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  // Likes
  likeVideo: async (userId: string, videoId: string) => {
    try {
      await addDoc(collection(db, 'likes'), {
        user_id: userId,
        video_id: videoId,
        created_at: new Date().toISOString()
      });
      return { data: true, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  unlikeVideo: async (userId: string, videoId: string) => {
    try {
      const q = query(
        collection(db, 'likes'), 
        where('user_id', '==', userId), 
        where('video_id', '==', videoId)
      );
      const querySnapshot = await getDocs(q);
      for (const doc of querySnapshot.docs) {
        await deleteDoc(doc.ref);
      }
      return { data: true, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  checkIsLiked: async (userId: string, videoId: string) => {
    try {
      const q = query(
        collection(db, 'likes'), 
        where('user_id', '==', userId), 
        where('video_id', '==', videoId),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      return { data: !querySnapshot.empty, error: null };
    } catch (error: any) {
      return { data: false, error };
    }
  },

  // Comments
  getComments: async (videoId: string) => {
    try {
      const q = query(
        collection(db, 'comments'), 
        where('video_id', '==', videoId),
        orderBy('created_at', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const comments: Comment[] = [];

      for (const commentDoc of querySnapshot.docs) {
        const commentData = commentDoc.data();
        const profileRef = doc(db, 'profiles', commentData.user_id);
        const profileSnap = await getDoc(profileRef);
        const profile = profileSnap.exists() ? (profileSnap.data() as Profile) : undefined;

        comments.push({
          id: commentDoc.id,
          ...commentData,
          profiles: profile
        } as Comment);
      }
      
      return { data: comments, error: null };
    } catch (error: any) {
      return { data: [], error };
    }
  },

  addComment: async (commentData: Partial<Comment>) => {
    try {
      const docRef = await addDoc(collection(db, 'comments'), {
        ...commentData,
        created_at: new Date().toISOString()
      });
      return { data: { id: docRef.id }, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  // Follows
  followUser: async (followerId: string, followingId: string) => {
    try {
      await addDoc(collection(db, 'follows'), {
        follower_id: followerId,
        following_id: followingId,
        created_at: new Date().toISOString()
      });
      return { data: true, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  unfollowUser: async (followerId: string, followingId: string) => {
    try {
      const q = query(
        collection(db, 'follows'), 
        where('follower_id', '==', followerId), 
        where('following_id', '==', followingId)
      );
      const querySnapshot = await getDocs(q);
      for (const doc of querySnapshot.docs) {
        await deleteDoc(doc.ref);
      }
      return { data: true, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  checkIsFollowing: async (followerId: string, followingId: string) => {
    try {
      const q = query(
        collection(db, 'follows'), 
        where('follower_id', '==', followerId), 
        where('following_id', '==', followingId),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      return { data: !querySnapshot.empty, error: null };
    } catch (error: any) {
      return { data: false, error };
    }
  },

  getFollowersCount: async (userId: string) => {
    try {
      const q = query(collection(db, 'follows'), where('following_id', '==', userId));
      const count = (await getCountFromServer(q)).data().count;
      return { count, error: null };
    } catch (error: any) {
      return { count: 0, error };
    }
  },

  getFollowingCount: async (userId: string) => {
    try {
      const q = query(collection(db, 'follows'), where('follower_id', '==', userId));
      const count = (await getCountFromServer(q)).data().count;
      return { count, error: null };
    } catch (error: any) {
      return { count: 0, error };
    }
  },

  // Search
  searchUsers: async (queryString: string) => {
    try {
      // Basic search: Firestore only supports range queries, so we can do a simple prefix search
      const q = query(
        collection(db, 'profiles'),
        where('username', '>=', queryString),
        where('username', '<=', queryString + '\uf8ff'),
        limit(20)
      );
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(doc => doc.data() as Profile);
      return { data: users, error: null };
    } catch (error: any) {
      return { data: [], error };
    }
  },

  searchVideos: async (queryString: string) => {
    try {
      // Firestore doesn't support full-text search out of the box. 
      // For demo purposes, we'll fetch some videos and filter in memory if needed, 
      // or just do a title match.
      const q = query(
        collection(db, 'videos'),
        where('title', '>=', queryString),
        where('title', '<=', queryString + '\uf8ff'),
        limit(20)
      );
      const querySnapshot = await getDocs(q);
      const videos: Video[] = [];

      for (const videoDoc of querySnapshot.docs) {
        const videoData = videoDoc.data();
        const profileRef = doc(db, 'profiles', videoData.user_id);
        const profileSnap = await getDoc(profileRef);
        const profile = profileSnap.exists() ? (profileSnap.data() as Profile) : undefined;

        videos.push({
          id: videoDoc.id,
          ...videoData,
          profiles: profile
        } as Video);
      }
      
      return { data: videos, error: null };
    } catch (error: any) {
      return { data: [], error };
    }
  }
};
