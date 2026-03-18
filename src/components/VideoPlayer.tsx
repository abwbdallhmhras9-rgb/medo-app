import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Music2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Video as VideoType, Profile } from '@/types';
import { Link } from 'react-router-dom';

interface VideoPlayerProps {
  video: VideoType;
  isActive: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likes_count || 0);
  const { user } = useAuth();

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().catch(() => {});
    } else {
      videoRef.current?.pause();
      if (videoRef.current) videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  useEffect(() => {
    if (user && video.id) {
      api.checkIsLiked(user.id, video.id).then(({ data }) => setLiked(!!data));
    }
  }, [user, video.id]);

  const handleLike = async () => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول للإعجاب بالفيديو');
      return;
    }

    if (liked) {
      const { error } = await api.unlikeVideo(user.id, video.id);
      if (!error) {
        setLiked(false);
        setLikesCount((prev: number) => prev - 1);
      }
    } else {
      const { error } = await api.likeVideo(user.id, video.id);
      if (!error) {
        setLiked(true);
        setLikesCount((prev: number) => prev + 1);
      }
    }
  };

  const togglePlay = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play();
    } else {
      videoRef.current?.pause();
    }
  };

  return (
    <div className="relative w-full h-full bg-black snap-start flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        src={video.video_url}
        className="h-full w-full object-contain cursor-pointer"
        loop
        playsInline
        onClick={togglePlay}
      />

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
        <div className="flex flex-row justify-between items-end pointer-events-auto">
          {/* Video Info */}
          <div className="flex-1 text-white mr-4">
            <Link to={`/profile/${video.profiles?.username}`} className="flex items-center gap-2 mb-3">
              <Avatar className="h-10 w-10 border border-white">
                <AvatarImage src={video.profiles?.avatar_url || ''} />
                <AvatarFallback className="bg-primary text-white">
                  {video.profiles?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-bold">@{video.profiles?.username}</span>
            </Link>
            <h3 className="font-semibold text-lg mb-1">{video.title}</h3>
            <p className="text-sm text-gray-200 line-clamp-2">{video.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Music2 className="h-4 w-4 animate-pulse" />
              <span className="text-xs">Original Audio - @{video.profiles?.username}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center gap-4 pb-4">
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full h-12 w-12 ${liked ? 'text-red-500' : 'text-white'} bg-white/10 hover:bg-white/20`}
                onClick={handleLike}
              >
                <Heart className={`h-8 w-8 ${liked ? 'fill-current' : ''}`} />
              </Button>
              <span className="text-xs text-white font-medium mt-1">{likesCount}</span>
            </div>

            <div className="flex flex-col items-center">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="rounded-full h-12 w-12 text-white bg-white/10 hover:bg-white/20"
              >
                <Link to={`/video/${video.id}`}>
                  <MessageCircle className="h-8 w-8" />
                </Link>
              </Button>
              <span className="text-xs text-white font-medium mt-1">{video.comments_count || 0}</span>
            </div>

            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="rounded-full h-12 w-12 text-white bg-white/10 hover:bg-white/20"
                onClick={() => {
                   navigator.clipboard.writeText(window.location.origin + '/video/' + video.id);
                   toast.success('تم نسخ الرابط');
                }}
              >
                <Share2 className="h-8 w-8" />
              </Button>
              <span className="text-xs text-white font-medium mt-1">Share</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
