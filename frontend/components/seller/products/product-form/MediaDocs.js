import { useState } from "react";
import FileInput from "@/components/ui/FileInput";
import { PhotoIcon, XMarkIcon, PlusIcon, EyeIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

export default function MediaDocs({ 
  images, 
  setImages, 
  videoFile, 
  setVideoFile, 
  pdfFile, 
  setPdfFile,
  error
}) {

  // Handle removing a specific image ID from the list
  const handleUpdate = (idx, newId) => {
      // If newId is null (deleted), remove from array
      if (!newId) {
          setImages(prev => prev.filter((_, i) => i !== idx));
      } else {
          // Update ID (replace)
          setImages(prev => {
              const clone = [...prev];
              clone[idx] = newId;
              return clone;
          });
      }
  };

  const handleAdd = (newId) => {
      if (newId) {
          setImages(prev => [...prev, newId]);
      }
  }

  return (
    <div className="space-y-6">
      {/* Images */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
            Product Images <span className="text-red-500">*</span>
        </label>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {/* Existing Images */}
            {images.map((imgId, idx) => (
                <FileInput
                    key={imgId || idx}
                    value={imgId}
                    onChange={(val) => handleUpdate(idx, val)}
                    folder="products/images"
                    accept="image/*"
                    className="h-full"
                >
                    {({ url, isUploading, progress, error, remove, open, setPreviewOpen }) => (
                         <div 
                            className="relative group aspect-square border-2 border-transparent bg-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                        >
                            <div 
                                className="w-full h-full cursor-pointer"
                                onClick={() => {
                                    if (url && !isUploading) setPreviewOpen(true);
                                }}
                            >
                                {url ? (
                                    <img 
                                        src={url} 
                                        className={`w-full h-full object-cover ${isUploading ? 'opacity-50' : ''}`} 
                                        alt="Product" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                    <PhotoIcon className="w-8 h-8" />
                                    </div>
                                )}
                            </div>
                            
                            {/* Hover Actions Overlay - Removed for Mobile Logic */}
                            
                            {/* Status Indicators */}
                            {isUploading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 pointer-events-none">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-1"></div>
                                    <span className="text-[10px] font-medium text-blue-700">{progress}%</span>
                                </div>
                            )}
                            
                            {/* Actions (Always visible on mobile, hover on desktop) */}
                            {!isUploading && (
                                <>
                                    {/* Edit Button - Top Left */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            open();
                                        }}
                                        className="absolute top-1 left-1 bg-white/90 text-gray-700 rounded-full p-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-20 hover:bg-white hover:text-blue-600 shadow-sm border border-gray-200"
                                        title="Change Image"
                                    >
                                        <PencilSquareIcon className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Delete Button - Top Right */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            remove(); 
                                        }}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-20 hover:bg-red-600 shadow-sm"
                                        title="Remove Image"
                                    >
                                        <XMarkIcon className="w-3.5 h-3.5" />
                                    </button>
                                </>
                            )}
                            
                            {error && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-2 text-center">
                                    <span className="text-white text-xs font-bold bg-red-500 px-2 py-1 rounded">{error}</span>
                                </div>
                            )}
                            
                            {idx === 0 && (
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1 pointer-events-none">
                                    <p className="text-[10px] text-white text-center font-medium">Main</p>
                                </div>
                            )}
                        </div>
                    )}
                </FileInput>
            ))}
            
            {/* Add Button */}
            {images.length < 8 && (
                <FileInput
                    key={`adder-${images.length}`} // Force reset on list change
                    value={null}
                    onChange={handleAdd}
                    folder="products/images"
                    accept="image/*"
                    className="h-full"
                >
                    {({ open, isUploading, progress, error }) => {
                        if (isUploading) {
                             return (
                                <div className="aspect-square relative flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-blue-300 rounded-xl">
                                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                     <span className="text-xs font-medium text-blue-600">Uploading {progress}%</span>
                                </div>
                             )
                        }
                        return (
                            <div 
                                className="relative aspect-square flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group overflow-hidden"
                                onClick={open}
                            >
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <PhotoIcon className="w-16 h-16 text-gray-200 group-hover:text-blue-200 transition-colors opacity-50" />
                                </div>
                                <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                                    <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                        <PlusIcon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 group-hover:text-blue-600">Add Image</span>
                                </div>
                                {error && (
                                    <div className="absolute bottom-2 left-2 right-2 text-center">
                                         <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded">{error}</span>
                                    </div>
                                )}
                            </div>
                        )
                    }}
                </FileInput>
            )}
        </div>
        {error && (
            <p className="text-xs text-red-500 mt-2">{error}</p>
        )}
      </div>

      {/* Video & PDF Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Video (Optional) */}
          <div className="space-y-1">
             <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Product Video</label>
             <div className="relative">
                <FileInput 
                    value={videoFile}
                    onChange={setVideoFile}
                    accept="video/mp4,video/*"
                    placeholder="Upload Video (MP4)"
                    folder="products/videos"
                />
             </div>
          </div>

          {/* PDF (Optional) */}
          <div className="space-y-1">
             <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Tech Spec Sheet</label>
             <div className="relative">
                <FileInput 
                    value={pdfFile}
                    onChange={setPdfFile}
                    accept="application/pdf"
                    placeholder="Upload PDF"
                    folder="products/docs"
                />
             </div>
          </div>
      </div>

    </div>
  );
}
