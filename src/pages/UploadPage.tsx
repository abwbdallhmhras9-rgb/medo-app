import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/db/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, Loader2, X, Film, CheckCircle2 } from 'lucide-react';

export const UploadPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit for demo
        toast.error('حجم الفيديو كبير جداً (الحد الأقصى 50 ميجابايت)');
        return;
      }
      setVideoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !user) {
      toast.error('يرجى اختيار فيديو أولاً');
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `videos/${user.uid}/${fileName}`;

      const { data: publicUrl, error: uploadError } = await api.uploadFile(videoFile, filePath);

      if (uploadError) throw uploadError;
      setProgress(70);

      const { error: dbError } = await api.uploadVideo({
        user_id: user.uid,
        video_url: publicUrl!,
        title,
        description,
        thumbnail_url: publicUrl, // Using video as thumbnail for now
      });

      if (dbError) throw dbError;

      setProgress(100);
      toast.success('تم رفع الفيديو بنجاح!');
      setTimeout(() => navigate('/'), 1500);
    } catch (error: any) {
      console.error('Error uploading video:', error);
      toast.error(`فشل الرفع: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Film className="h-6 w-6 text-primary" />
            نشر فيديو جديد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-6">
            {!previewUrl ? (
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 text-center hover:border-primary transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">اختر فيديو للتحميل</h3>
                <p className="text-sm text-muted-foreground mt-1">أو اسحب وأفلت الملف هنا</p>
                <p className="text-xs text-muted-foreground mt-4">MP4, WebM (حد أقصى 50MB)</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="video/*"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-[400px] mx-auto group">
                <video 
                  src={previewUrl} 
                  className="h-full w-full object-contain"
                  controls
                />
                <Button 
                  type="button"
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={removeVideo}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان الفيديو</Label>
                <Input 
                  id="title" 
                  placeholder="أضف عنواناً جذاباً..." 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea 
                  id="description" 
                  placeholder="أخبر المتابعين المزيد عن هذا الفيديو..." 
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg" disabled={uploading || !videoFile}>
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  جاري الرفع ({progress}%)
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  نشر الفيديو
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
