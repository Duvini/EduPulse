import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { skillPostService } from '../../services/skillPostService';

const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/gif'];
const SUPPORTED_VIDEO_FORMATS = ['video/mp4'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_DURATION = 30; // seconds
const MAX_IMAGES = 3;
const BASE_URL = 'http://localhost:8080';

const validateVideoDuration = (file) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration <= MAX_VIDEO_DURATION);
    };
    video.src = URL.createObjectURL(file);
  });
};

const skillPostValidationSchema = Yup.object().shape({
  description: Yup.string()
    .required('Description is required')
    .min(1, 'Description must not be empty')
    .max(1000, 'Description must not exceed 1000 characters'),
  tags: Yup.string()
    .nullable()
    .matches(/^[a-zA-Z0-9\s,]*$/, 'Tags can only contain letters, numbers, and commas'),
  mediaFiles: Yup.array()
    .nullable()
    .test('fileSize', 'Each file must be less than 10MB', (files) => {
      if (!files || files.length === 0) return true;
      return files.every(file => file.size <= MAX_FILE_SIZE);
    })
    .test('fileType', 'Only images (JPEG, PNG, GIF) and videos (MP4) are allowed', (files) => {
      if (!files || files.length === 0) return true;
      return files.every(file => 
        SUPPORTED_IMAGE_FORMATS.includes(file.type) || 
        SUPPORTED_VIDEO_FORMATS.includes(file.type)
      );
    })
    .test('fileCount', 'You can upload up to 3 images or 1 video', (files) => {
      if (!files || files.length === 0) return true;
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      const videoFiles = files.filter(file => file.type.startsWith('video/'));
      return (imageFiles.length <= MAX_IMAGES && videoFiles.length === 0) || 
             (videoFiles.length === 1 && imageFiles.length === 0);
    })
    .test('videoDuration', 'Video must be less than 30 seconds', async files => {
      if (!files || files.length === 0) return true;
      const videoFile = files.find(file => file.type.startsWith('video/'));
      if (!videoFile) return true;
      return await validateVideoDuration(videoFile);
    })
});

const SkillPostEditForm = ({ postId, initialData, onSubmitSuccess }) => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [fileError, setFileError] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize previews with existing media files
    if (initialData.mediaUrls && initialData.mediaUrls.length > 0) {
      const initialPreviews = initialData.mediaUrls.map(url => ({
        id: url,
        url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
        type: url.toLowerCase().endsWith('.mp4') ? 'video' : 'image',
        isExisting: true
      }));
      setPreviews(initialPreviews);
    }
  }, [initialData.mediaUrls]);

  // Separate cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup previews on unmount
      previews.forEach(preview => {
        if (!preview.isExisting) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [previews]);

  const handleFileChange = async (event, setFieldValue) => {
    const newFiles = Array.from(event.currentTarget.files);
    
    // Reset error state
    setFileError(null);
    
    // Validate file size first
    const oversizedFiles = newFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      setFileError('Each file must be less than 10MB');
      event.target.value = '';
      return;
    }

    const isNewVideo = newFiles.some(file => file.type.startsWith('video/'));
    const hasExistingVideo = mediaFiles.some(file => file.type.startsWith('video/'));
    const currentImages = mediaFiles.filter(file => file.type.startsWith('image/'));
    const newImages = newFiles.filter(file => file.type.startsWith('image/'));
    
    // Check total number of images being added
    const totalImageCount = currentImages.length + newImages.length;
    if (totalImageCount > MAX_IMAGES) {
      setFileError(`You cannot select more than ${MAX_IMAGES} images. Please select fewer images.`);
      event.target.value = '';
      return;
    }

    // Prevent mixing videos and images
    if (isNewVideo && mediaFiles.length > 0) {
      setFileError('You can only upload either images or a video, not both');
      event.target.value = '';
      return;
    }
    
    if (hasExistingVideo) {
      setFileError('Please remove the existing video before uploading new files');
      event.target.value = '';
      return;
    }

    // Handle video upload
    if (isNewVideo) {
      if (newFiles.length > 1) {
        setFileError('You can only upload 1 video');
        event.target.value = '';
        return;
      }

      // Validate video duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      try {
        const duration = await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            resolve(video.duration);
          };
          video.src = URL.createObjectURL(newFiles[0]);
        });

        if (duration > MAX_VIDEO_DURATION) {
          setFileError('Video must be less than 30 seconds');
          event.target.value = '';
          return;
        }

        const newMediaFiles = newFiles;
        setMediaFiles(newMediaFiles);
        setFieldValue('mediaFiles', newMediaFiles);
        
        // Update preview for video
        const newPreviews = newMediaFiles.map(file => ({
          id: URL.createObjectURL(file),
          url: URL.createObjectURL(file),
          type: 'video'
        }));
        
        // Cleanup old previews
        previews.forEach(preview => URL.revokeObjectURL(preview.url));
        setPreviews(newPreviews);
      } catch (error) {
        console.error('Error checking video duration:', error);
        setFileError('Could not validate video duration');
        event.target.value = '';
      } finally {
        URL.revokeObjectURL(video.src);
      }
      return;
    }

    // Handle image upload
    const updatedMediaFiles = [...mediaFiles, ...newFiles];
    setMediaFiles(updatedMediaFiles);
    setFieldValue('mediaFiles', updatedMediaFiles);

    // Update previews while keeping existing ones
    const newPreviews = [
      ...previews,
      ...newFiles.map(file => ({
        id: URL.createObjectURL(file),
        url: URL.createObjectURL(file),
        type: 'image'
      }))
    ];
    setPreviews(newPreviews);
  };

  const removeFile = (index, setFieldValue) => {
    const newMediaFiles = mediaFiles.filter((_, i) => i !== index);
    setMediaFiles(newMediaFiles);
    setFieldValue('mediaFiles', newMediaFiles);
    setFileError(null);

    // Cleanup removed preview
    URL.revokeObjectURL(previews[index].url);
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const tagArray = values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
      const response = await skillPostService.updatePost(postId, values.description, tagArray, values.mediaFiles);
      
      if (response.error) {
        setError(response.message || 'Failed to update post');
        return;
      }
      
      if (onSubmitSuccess) {
        onSubmitSuccess(response);
      }
    } catch (error) {
      console.error('Error updating post:', error);
      setError('Failed to update post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{
        description: initialData.description || '',
        tags: initialData.tags ? initialData.tags.join(', ') : '',
        mediaFiles: []
      }}
      validationSchema={skillPostValidationSchema}
      onSubmit={handleSubmit}
    >
      {({ setFieldValue, isSubmitting, values }) => (
        <Form className="bg-white rounded-lg shadow-md overflow-hidden max-w-xl w-full mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Edit Post</h2>
            <button
              type="button"
              onClick={() => onSubmitSuccess({ cancelled: true })}
              className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="p-4 mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {fileError && (
            <div className="p-4 mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{fileError}</span>
            </div>
          )}

          {/* Main content */}
          <div className="px-6 py-2">
            <Field
              as="textarea"
              id="description"
              name="description"
              rows="5"
              className="w-full border-0 focus:ring-0 text-base placeholder-gray-400 resize-none p-0 focus:outline-none"
              placeholder="What do you want to talk about?"
              style={{ minHeight: "120px" }}
            />
            <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />

            <div className="mt-2">
              <Field
                type="text"
                id="tags"
                name="tags"
                className="w-full border-0 focus:ring-0 text-sm text-gray-500 placeholder-gray-400 p-0 focus:outline-none"
                placeholder="#Add_tags_separated_by_commas"
              />
              <ErrorMessage name="tags" component="div" className="mt-1 text-sm text-red-600" />
            </div>
          </div>

          {/* Media preview */}
          {previews.length > 0 && (
            <div className="px-6 py-3">
              <div className={`grid ${previews.length > 1 ? 'grid-cols-2 gap-3' : 'grid-cols-1'} rounded-lg overflow-hidden border border-gray-200`}>
                {previews.map((preview, index) => (
                  <div key={preview.id} className="relative group rounded-md overflow-hidden bg-gray-50 aspect-video">
                    {preview.type === 'video' ? (
                      <video 
                        src={preview.url} 
                        className="w-full h-full object-contain"
                        controls
                      />
                    ) : (
                      <img 
                        src={preview.url} 
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index, setFieldValue)}
                      className="absolute top-2 right-2 p-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all duration-200 shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Post options */}
          <div className="px-6 py-3 mt-2">
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center justify-center px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-600">Photo</span>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, setFieldValue)}
                  accept="image/jpeg,image/png,image/gif"
                  multiple
                  className="hidden"
                />
              </label>
              
              <label className="flex items-center justify-center px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-600">Video</span>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, setFieldValue)}
                  accept="video/mp4"
                  className="hidden"
                />
              </label>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-500 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Up to 3 images or 1 video (10MB max)
              </p>
              <span className="text-xs text-gray-500">
                {values?.description?.length || 0}/1000
              </span>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            <button
              type="button"
              onClick={() => onSubmitSuccess({ cancelled: true })}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none transition duration-150 ease-in-out"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none transition duration-150 ease-in-out ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Update Post'
              )}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default SkillPostEditForm;