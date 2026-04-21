import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImagePickerProps {
  initialValue?: string | null;
  onUploadSuccess: (url: string) => void;
  label?: string;
}

export const ImagePicker = ({ initialValue, onUploadSuccess, label }: ImagePickerProps) => {
  const [preview, setPreview] = useState<string | null>(initialValue || null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;

  const handleUpload = async (file: File) => {
    if (!cloudName || !uploadPreset || cloudName === 'your_cloud_name') {
      toast.error('Cloudinary is not configured. Please check your .env file.');
      return;
    }

    setIsUploading(true);
    setStatus('uploading');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('api_key', apiKey);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        console.error('[ImagePicker] Cloudinary Error Details:', responseData);
        throw new Error(responseData.error?.message || 'Upload failed');
      }

      const imageUrl = responseData.secure_url;

      setPreview(imageUrl);
      setStatus('success');
      onUploadSuccess(imageUrl);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('[ImagePicker] Upload Catch Error:', error);
      setStatus('error');
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const removeImage = () => {
    setPreview(null);
    setStatus('idle');
    onUploadSuccess('');
  };

  return (
    <div className="flex flex-col gap-3">
      {label && (
        <label className="text-sm font-black text-gray-700 uppercase tracking-widest">
          {label}
        </label>
      )}

      <div className="relative group">
        {preview ? (
          <div className="relative w-full aspect-video md:aspect-square bg-gray-100 rounded-[2rem] overflow-hidden border-2 border-orange-500/20 shadow-xl shadow-orange-500/5 group">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />

            {/* Overlay actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-white rounded-full text-gray-900 hover:scale-110 transition-transform shadow-lg"
                title="Change Image"
              >
                <ImageIcon size={24} />
              </button>
              <button
                type="button"
                onClick={removeImage}
                className="p-3 bg-white rounded-full text-red-600 hover:scale-110 transition-transform shadow-lg"
                title="Remove Image"
              >
                <X size={24} />
              </button>
            </div>

            {status === 'success' && (
              <div className="absolute top-4 right-4 bg-green-500 text-white p-1 rounded-full animate-in zoom-in duration-300">
                <CheckCircle2 size={20} />
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`w-full aspect-video md:aspect-square border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${status === 'error'
              ? 'border-red-200 bg-red-50 text-red-500'
              : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-500'
              }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={40} className="animate-spin text-orange-500" />
                <span className="text-xs font-black uppercase tracking-widest text-orange-500 animate-pulse">
                  Uploading...
                </span>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center text-gray-300 group-hover:text-orange-500 group-hover:shadow-orange-100 transition-all">
                  <UploadCloud size={32} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-black uppercase tracking-widest text-gray-900">
                    Upload Product Image
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 mt-1">
                    DRAG & DROP OR BROWSE FILES
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Hidden inputs */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={onFileChange}
        />
        <input
          type="file"
          ref={cameraInputRef}
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={onFileChange}
        />
      </div>

      {/* Quick Camera Action (Mobile optimized) */}
      {!preview && !isUploading && (
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="md:hidden flex items-center justify-center gap-3 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-gray-200 active:scale-95 transition-all"
        >
          <Camera size={20} />
          Take Photo
        </button>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-600 animate-in slide-in-from-top-2">
          <AlertCircle size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Upload failed. Please try again.
          </span>
        </div>
      )}
    </div>
  );
};