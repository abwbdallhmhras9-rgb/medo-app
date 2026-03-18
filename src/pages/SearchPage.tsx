import React, { useState, useEffect } from 'react';
import { api } from '@/db/api';
import { Profile, Video } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Loader2, PlayCircle, User, Heart, MessageCircle } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedQuery) {
        setLoading(true);
        const { data } = await api.getVideos(10);
        setVideos(data || []);
        setProfiles([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [{ data: profilesData }, { data: videosData }] = await Promise.all([
          api.searchUsers(debouncedQuery),
          api.searchVideos(debouncedQuery)
        ]);
        setProfiles(profilesData || []);
        setVideos(videosData || []);
      } catch (error) {
        console.error('فشل في البحث:', error);
      } finally {
        setLoading(false);
      }
    };

    handleSearch();
  }, [debouncedQuery]);

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <div className="relative mb-8">
        <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          className="pr-12 h-14 text-lg rounded-full border-2 focus-visible:ring-primary shadow-sm"
          placeholder="ابحث عن فيديوهات أو حسابات..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 mb-8">
          <TabsTrigger value="videos" className="gap-2">
            <PlayCircle className="h-4 w-4" />
            فيديوهات
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <User className="h-4 w-4" />
            مستخدمين
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-20 opacity-50">
              <PlayCircle className="h-12 w-12 mx-auto mb-4" />
              <p>لم يتم العثور على فيديوهات تطابق بحثك</p>
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
                    <p className="text-white text-xs font-medium truncate mb-1">{video.title}</p>
                    <div className="flex items-center gap-3 text-white text-xs font-medium">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 fill-current" />
                        {video.likes_count || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3 fill-current" />
                        {video.comments_count || 0}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-20 opacity-50">
              <User className="h-12 w-12 mx-auto mb-4" />
              <p>لم يتم العثور على مستخدمين يطابقون بحثك</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {profiles.map((profile) => (
                <div 
                  key={profile.id} 
                  className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <Link to={`/profile/${profile.username}`} className="flex items-center gap-4 flex-1">
                    <Avatar className="h-16 w-16 border-2 border-primary/10">
                      <AvatarImage src={profile.avatar_url || ''} />
                      <AvatarFallback className="text-xl bg-primary text-white">
                        {profile.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">@{profile.username}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{profile.bio || 'لا يوجد نبذة شخصية'}</p>
                    </div>
                  </Link>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/profile/${profile.username}`}>عرض الملف</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
