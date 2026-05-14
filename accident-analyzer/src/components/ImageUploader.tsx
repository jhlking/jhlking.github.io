import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccidentStore } from '../stores/accidentStore';

const ImageUploader: React.FC = () => {
  const { images, currentImageIndex, addImage, removeImage, setCurrentImageIndex } = useAccidentStore();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          addImage(result);
        };
        reader.readAsDataURL(file);
      }
    });
  }, [addImage]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files);
  }, [handleFile]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFile]);

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInput}
        className="hidden"
      />

      {images.length === 0 ? (
        <motion.div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative overflow-hidden
            border-2 border-dashed rounded-2xl
            ${isDragging
              ? 'border-blue-400 bg-blue-500/10'
              : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
            }
            cursor-pointer
            transition-all duration-300
          `}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <motion.div
              animate={{ y: isDragging ? -10 : 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className={`
                w-20 h-20 rounded-full flex items-center justify-center mb-4
                ${isDragging ? 'bg-blue-500/20' : 'bg-slate-700/50'}
              `}>
                <Upload className={`w-10 h-10 ${isDragging ? 'text-blue-400' : 'text-slate-400'}`} />
              </div>
            </motion.div>

            <h3 className="text-xl font-semibold text-slate-200 mb-2">
              {isDragging ? '松开以上传图片' : '上传事故现场照片'}
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              支持拖拽或点击上传，支持多张照片
            </p>
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <ImageIcon className="w-4 h-4" />
              <span>支持 JPG、PNG 格式</span>
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none" />
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-slate-800/50 border border-slate-700">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <img
                  src={images[currentImageIndex]}
                  alt={`事故现场 ${currentImageIndex + 1}`}
                  className="w-full h-auto max-h-[500px] object-contain bg-slate-900"
                />
              </motion.div>
            </AnimatePresence>

            <button
              onClick={() => removeImage(currentImageIndex)}
              className="absolute top-3 right-3 p-2 bg-red-500/80 hover:bg-red-500 rounded-full backdrop-blur-sm transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors
                    ${index === currentImageIndex ? 'border-blue-500' : 'border-transparent'}
                  `}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          )}

          <motion.button
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e: React.DragEvent) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files);
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 border-2 border-dashed border-slate-600 hover:border-slate-500 rounded-xl text-slate-400 hover:text-slate-300 transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            <span>添加更多照片</span>
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
