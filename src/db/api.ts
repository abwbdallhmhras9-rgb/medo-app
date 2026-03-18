import { supabase } from './supabase';
import type { Profile, Video, Comment, Like, Follow } from '@/types';

export const api = {
  // Profiles
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    return { data: data as Profile | null, error };
  },

  getProfileByUsername: async (username: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .maybeSingle();
    return { data: data as Profile | null, error };
  },

  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    return { data, error };
  },

  // Videos
  getVideos: async (limit = 10, offset = 0) => {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        profiles!user_id (*),
        likes (count),
        comments (count)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const formattedData = data?.map((v: any) => ({
      ...v,
      likes_count: v.likes?.[0]?.count || 0,
      comments_count: v.comments?.[0]?.count || 0
    })) || [];
    
    return { data: formattedData as Video[], error };
  },

  getUserVideos: async (userId: string) => {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        profiles!user_id (*),
        likes (count),
        comments (count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    const formattedData = data?.map((v: any) => ({
      ...v,
      likes_count: v.likes?.[0]?.count || 0,
      comments_count: v.comments?.[0]?.count || 0
    })) || [];
    
    return { data: formattedData as Video[], error };
  },

  uploadVideo: async (videoData: Partial<Video>) => {
    const { data, error } = await supabase
      .from('videos')
      .insert([videoData]);
    return { data, error };
  },

  // Likes
  likeVideo: async (userId: string, videoId: string) => {
    const { data, error } = await supabase
      .from('likes')
      .insert([{ user_id: userId, video_id: videoId }]);
    return { data, error };
  },

  unlikeVideo: async (userId: string, videoId: string) => {
    const { data, error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('video_id', videoId);
    return { data, error };
  },

  checkIsLiked: async (userId: string, videoId: string) => {
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('video_id', videoId)
      .maybeSingle();
    return { data: !!data, error };
  },

  // Comments
  getComments: async (videoId: string) => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles!user_id (*)
      `)
      .eq('video_id', videoId)
      .order('created_at', { ascending: true });
    return { data: data as Comment[], error };
  },

  addComment: async (commentData: Partial<Comment>) => {
    const { data, error } = await supabase
      .from('comments')
      .insert([commentData]);
    return { data, error };
  },

  // Follows
  followUser: async (followerId: string, followingId: string) => {
    const { data, error } = await supabase
      .from('follows')
      .insert([{ follower_id: followerId, following_id: followingId }]);
    return { data, error };
  },

  unfollowUser: async (followerId: string, followingId: string) => {
    const { data, error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    return { data, error };
  },

  checkIsFollowing: async (followerId: string, followingId: string) => {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();
    return { data: !!data, error };
  },

  getFollowersCount: async (userId: string) => {
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);
    return { count: count || 0, error };
  },

  getFollowingCount: async (userId: string) => {
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);
    return { count: count || 0, error };
  },

  // Search
  searchUsers: async (query: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${query}%`)
      .limit(20);
    return { data: data as Profile[], error };
  },

  searchVideos: async (query: string) => {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        profiles!user_id (*)
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(20);
    return { data: data as Video[], error };
  }
};
