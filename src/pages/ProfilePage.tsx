import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/db/api';
import { Profile, Video } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Settings, Edit, PlayCircle, Grid, Heart, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const { user, profile: currentUserProfile } = useAuth();

  useEffect(() => {
    const fetchProfileAndVideos = async () => {
      if (!username) return;
      setLoading(true);
      try {
        const { data: profileData, error: profileError } = await api.getProfileByUsername(username);
        if (profileError || !profileData) throw new Error('الملف الشخصي غير موجود');
        setProfile(profileData);

        const { data: videosData } = await api.getUserVideos(profileData.id);
        setVideos(videosData || []);

        const { count: followers } = await api.getFollowersCount(profileData.id);
        setFollowersCount(followers || 0);

        const { count: following } = await api.getFollowingCount(profileData.id);
        setFollowingCount(following || 0);

        if (user && user.uid !== profileData.id) {
          const { data: followingStatus } = await api.checkIsFollowing(user.uid, profileData.id);
          setIsFollowing(!!followingStatus);
        }
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndVideos();
  }, [username, user]);

  const handleFollow = async () => {
    if (!user || !profile) {
      toast.error('يرجى تسجيل الدخول للمتابعة');
      return;
    }

    if (isFollowing) {
      const { error } = await api.unfollowUser(user.uid, profile.id);
      if (!error) {
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
      }
    } else {
      const { error } = await api.followUser(user.uid, profile.id);
      if (!error) {
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 text-center">
        <h2 className="text-xl font-bold mb-2">المستخدم غير موجود</h2>
        <Button asChild variant="link">
          <Link to="/">العودة للرئيسية</Link>
        </Button>
      </div>
    );
  }

  const isOwnProfile = user?.uid === profile.id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <Avatar className="h-32 w-32 border-4 border-primary/10">
          <AvatarImage src={profile.avatar_url || ''} />
          <AvatarFallback className="text-4xl bg-primary text-white">
            {profile.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center md:text-right">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            <h1 className="text-3xl font-bold">@{profile.username}</h1>
            <div className="flex gap-2">
              {isOwnProfile ? (
                <>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info('سيتم تفعيل هذه الميزة قريباً')}>
                    <Edit className="h-4 w-4" />
                    تعديل الملف
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => toast.info('سيتم تفعيل الإعدادات قريباً')}>
                    <Settings className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <Button 
                  variant={isFollowing ? "outline" : "default"} 
                  className="w-32"
                  onClick={handleFollow}
                >
                  {isFollowing ? 'إلغاء المتابعة' : 'متابعة'}
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-8 mb-4 text-sm">
            <div className="flex flex-col items-center md:items-start">
              <span className="font-bold text-lg">{followingCount}</span>
              <span className="text-muted-foreground">أتابع</span>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <span className="font-bold text-lg">{followersCount}</span>
              <span className="text-muted-foreground">متابعين</span>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <span className="font-bold text-lg">{videos.length}</span>
              <span className="text-muted-foreground">فيديو</span>
            </div>
          </div>

          <p className="text-muted-foreground max-w-md mx-auto md:mx-0">
            {profile.bio || 'لا يوجد نبذة شخصية بعد.'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 mb-8">
          <TabsTrigger value="videos" className="gap-2">
            <Grid className="h-4 w-4" />
            الفيديوهات
          </TabsTrigger>
          <TabsTrigger value="liked" className="gap-2">
            <Heart className="h-4 w-4" />
            أعجبني
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos">
          {videos.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-xl">
              <PlayCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground font-medium">لا توجد فيديوهات منشورة بعد</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videos.map((video) => (
                <Link 
                  key={video.id} 
                  to={`/video/${video.id}`}
                  className="group relative aspect-[9/16] bg-black rounded-lg overflow-hidden border border-border/50 hover:border-primary transition-all"
                >
                  <video 
                    src={video.video_url} 
                    className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end p-2 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-3 text-white text-xs font-medium">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 fill-current" />
                        {video.likes_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3 fill-current" />
                        {video.comments_count}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="liked">
          <div className="text-center py-20 bg-muted/20 rounded-xl">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground font-medium">الفيديوهات التي تعجب {profile.username} ستظهر هنا</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
