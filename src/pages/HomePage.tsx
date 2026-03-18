import React, { useEffect, useState, useRef } from 'react';
import { api } from '@/db/api';
import { Video as VideoType } from '@/types';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Loader2 } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await api.getVideos(10);
        if (error) throw error;
        setVideos(data || []);
      } catch (err) {
        console.error('فشل في جلب الفيديوهات:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    const index = Math.round(scrollTop / clientHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 text-center">
        <h2 className="text-xl font-bold mb-2">لا يوجد فيديوهات بعد</h2>
        <p className="text-muted-foreground">كن أول من ينشر فيديو!</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="h-[calc(100vh-64px)] overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-black no-scrollbar"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {videos.map((video, index) => (
        <div key={video.id} className="h-full w-full snap-start relative">
          <VideoPlayer video={video} isActive={index === activeIndex} />
        </div>
      ))}
    </div>
  );
};
