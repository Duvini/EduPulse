import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../../services/axiosConfig';

const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/gif'];
const SUPPORTED_VIDEO_FORMATS = ['video/mp4'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_DURATION = 30; // seconds
const MAX_IMAGES = 3;

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
    .min(10, 'Description must be at least 10 characters long'),
  tags: Yup.string()
    .matches(/^(\w+)(,\s*\w+)*$/, 'Tags must be comma-separated words')
    .nullable(),
  mediaFiles: Yup.array()
    .test('fileType', 'Only images (JPG, PNG, GIF) or videos (MP4) are allowed', files => {
      if (!files || files.length === 0) return true;
      return files.every(file => 
        SUPPORTED_IMAGE_FORMATS.includes(file.type) || 
        SUPPORTED_VIDEO_FORMATS.includes(file.type)
      );
    })
    .test('fileSize', 'Files must be less than 10MB', files => {
      if (!files || files.length === 0) return true;
      return files.every(file => file.size <= MAX_FILE_SIZE);
    })
    .test('fileCount', 'You can upload either up to 3 images OR 1 video', files => {
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

  useEffect(() => {
    // Cleanup previews on unmount
    return () => {
      previews.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

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
    const formData = new FormData();
    formData.append('description', values.description);
    
    if (values.tags) {
      const tagArray = values.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      tagArray.forEach(tag => formData.append('tags', tag));
    }

    // Append media files
    values.mediaFiles?.forEach(file => {
      formData.append('mediaFiles', file);
    });

    try {
      const response = await axiosInstance.put(`/api/v1/skillposts/${postId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 200) {
        onSubmitSuccess(response.data);
      }
    } catch (error) {
      console.error('Error updating skill post:', error);
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
        <Form className="bg-white p-4 rounded-lg shadow-md space-y-4">
          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <Field
              id="description"
              name="description"
              as="textarea"
              rows="4"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Write your post description here..."
            />
            <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
          </div>

          {/* Tags Field */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags
            </label>
            <Field
              id="tags"
              name="tags"
              type="text"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., java, spring, backend"
            />
            <ErrorMessage name="tags" component="div" className="text-red-500 text-sm mt-1" />
          </div>

          {/* Media Upload Field */}
          <div>
            <label htmlFor="mediaFiles" className="block text-sm font-medium text-gray-700">
              Upload Media (Optional)
            </label>
            <input
              id="mediaFiles"
              type="file"
              accept="image/jpeg,image/png,image/gif,video/mp4"
              multiple
              onChange={(e) => handleFileChange(e, setFieldValue)}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <ErrorMessage name="mediaFiles" component="div" className="text-red-500 text-sm mt-1" />
            <p className="mt-1 text-sm text-gray-500">
              You can upload either up to 3 images (JPG, PNG, GIF) or 1 video (MP4, max 30 seconds). Each file must be less than 10MB.
            </p>
          </div>

          {/* Media Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {previews.map((preview, index) => (
                <div key={preview.id} className="relative">
                  {preview.type === 'image' ? (
                    <img
                      src={preview.url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <video
                      src={preview.url}
                      className="w-full h-32 object-cover rounded-lg"
                      controls
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index, setFieldValue)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isSubmitting}
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