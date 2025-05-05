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

    return () => {
      // Cleanup previews on unmount
      previews.forEach(preview => {
        if (!preview.isExisting) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [initialData.mediaUrls]);

  const handleFileChange = (event, setFieldValue) => {
    const newFiles = Array.from(event.currentTarget.files);
    const isNewVideo = newFiles.some(file => file.type.startsWith('video/'));
    const hasExistingVideo = mediaFiles.some(file => file.type.startsWith('video/'));
    const currentImages = mediaFiles.filter(file => file.type.startsWith('image/'));
    
    // Prevent mixing videos and images
    if (isNewVideo && mediaFiles.length > 0) {
      alert('You can only upload either images or a video, not both');
      return;
    }
    
    if (hasExistingVideo) {
      alert('Please remove the existing video before uploading new files');
      return;
    }

    // Handle video upload
    if (isNewVideo) {
      if (newFiles.length > 1) {
        alert('You can only upload 1 video');
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
      return;
    }

    // Handle image upload
    const totalImageCount = currentImages.length + newFiles.length;
    if (totalImageCount > MAX_IMAGES) {
      alert(`You can only upload up to ${MAX_IMAGES} images. You can select ${MAX_IMAGES - currentImages.length} more.`);
      return;
    }

    // Combine existing and new files
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
      {({ setFieldValue, isSubmitting }) => (
        <Form className="bg-white rounded-lg shadow-sm space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <Field
              as="textarea"
              id="description"
              name="description"
              rows="4"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags (comma-separated)
            </label>
            <Field
              type="text"
              id="tags"
              name="tags"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            <ErrorMessage name="tags" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Media Files
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                onChange={(e) => handleFileChange(e, setFieldValue)}
                accept=".jpg,.jpeg,.png,.gif,.mp4"
                multiple
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
            <ErrorMessage name="mediaFiles" component="div" className="mt-1 text-sm text-red-600" />
            
            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {previews.map((preview, index) => (
                  <div key={preview.id} className="relative">
                    {preview.type === 'video' ? (
                      <video 
                        src={preview.url} 
                        className="w-full h-32 object-cover rounded-lg"
                        controls
                      />
                    ) : (
                      <img 
                        src={preview.url} 
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index, setFieldValue)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 focus:outline-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Upload up to 3 images (JPEG, PNG, GIF) or 1 video (MP4). Max 10MB each.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => onSubmitSuccess({ cancelled: true })}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Updating...' : 'Update Post'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default SkillPostEditForm;