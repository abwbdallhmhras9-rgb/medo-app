import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/db/api';
import { Video as VideoType, Comment as CommentType } from '@/types';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Loader2, ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const VideoDetailPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const [video, setVideo] = useState<VideoType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideoAndComments = async () => {
      if (!videoId) return;
      setLoading(true);
      try {
        const { data: videosData } = await api.getVideos(100); // Simple way to find one
        const foundVideo = videosData.find(v => v.id === videoId);
        if (foundVideo) {
          setVideo(foundVideo);
          const { data: commentsData } = await api.getComments(videoId);
          setComments(commentsData || []);
        } else {
          toast.error('الفيديو غير موجود');
          navigate('/');
        }
      } catch (err) {
        console.error('فشل في جلب الفيديو:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideoAndComments();
  }, [videoId, navigate]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('يرجى تسجيل الدخول للتعليق');
      return;
    }
    if (!commentText.trim() || !videoId) return;

    setSubmitting(true);
    try {
      const { error } = await api.addComment({
        user_id: user.uid,
        video_id: videoId,
        content: commentText.trim()
      });
      if (error) throw error;
      
      const { data: commentsData } = await api.getComments(videoId);
      setComments(commentsData || []);
      setCommentText('');
      toast.success('تم إضافة التعليق');
    } catch (err: any) {
      toast.error(`فشل في إضافة التعليق: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-black overflow-hidden">
      {/* Video Side */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 z-50 text-white bg-white/10 hover:bg-white/20"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <VideoPlayer video={video} isActive={true} />
      </div>

      {/* Sidebar Side (Desktop only) or Bottom Side (Mobile) */}
      <div className="w-full lg:w-[400px] bg-background flex flex-col border-r border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-lg">التعليقات ({comments.length})</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-muted/10">
          {comments.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              <p>لا توجد تعليقات بعد. كن أول من يعلق!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.profiles?.avatar_url || ''} />
                  <AvatarFallback className="bg-primary text-white">
                    {comment.profiles?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">@{comment.profiles?.username}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  <p className="text-sm bg-muted/50 p-3 rounded-2xl rounded-tr-none inline-block">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <div className="p-4 border-t border-border bg-background">
          {user ? (
            <form onSubmit={handleAddComment} className="flex gap-2">
              <Input 
                placeholder="أضف تعليقاً..." 
                className="rounded-full bg-muted border-none focus-visible:ring-primary"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="rounded-full shrink-0" 
                disabled={submitting || !commentText.trim()}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground mb-2">سجل دخولك للتعليق</p>
              <Button size="sm" onClick={() => navigate('/login')}>تسجيل دخول</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
