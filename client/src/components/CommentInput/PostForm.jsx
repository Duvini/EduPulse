import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { FiImage, FiVideo, FiX, FiInfo, FiSmile } from 'react-icons/fi';
import { useStore } from '../../../store';
import { getMediaUrl } from '../../services/axiosConfig';

const MAX_IMAGES = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_DURATION = 30; // seconds

// Default user avatar as SVG data URL
const defaultUserAvatar = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23CBD5E1"%3E%3Cpath d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"%3E%3C/path%3E%3C/svg%3E';

const postValidationSchema = Yup.object().shape({
  description: Yup.string()
    .required('Description is required')
    .min(1, 'Description must not be empty')
    .max(1000, 'Description must not exceed 1000 characters'),
  tags: Yup.string()
    .nullable()
    .matches(/^[a-zA-Z0-9\s,]*$/, 'Tags can only contain letters, numbers, and commas')
});

const PostForm = ({ onSubmit, onCancel, isEdit, initialValues }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileError, setFileError] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [avatarError, setAvatarError] = useState(false);
  const { user } = useStore();
  const fileInputRef = React.useRef();

  // Cleanup effect for file previews
  useEffect(() => {
    return () => {
      // Cleanup previews on unmount
      previews.forEach(preview => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [previews]);

  const removeFile = (index) => {
    // Cleanup preview URL
    URL.revokeObjectURL(previews[index].url);
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setFileError(null);
  };

  const handleFileChange = async (event) => {
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

    // Check if we have any videos
    const hasVideo = newFiles.some(file => file.type.startsWith('video/'));
    const hasExistingVideo = selectedFiles.some(file => file.type.startsWith('video/'));
    const currentImages = selectedFiles.filter(file => file.type.startsWith('image/'));
    const newImages = newFiles.filter(file => file.type.startsWith('image/'));
    
    // Check total number of images being added
    const totalImageCount = currentImages.length + newImages.length;
    if (totalImageCount > MAX_IMAGES) {
      setFileError(`You cannot select more than ${MAX_IMAGES} images. Please select fewer images.`);
      event.target.value = '';
      return;
    }

    // Prevent mixing videos and images
    if (hasVideo && selectedFiles.length > 0) {
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
    if (hasVideo) {
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

        setSelectedFiles([newFiles[0]]);
        // Add video preview
        setPreviews([{
          id: URL.createObjectURL(newFiles[0]),
          url: URL.createObjectURL(newFiles[0]),
          type: 'video'
        }]);
      } catch (error) {
        console.error('Error checking video duration:', error);
        setFileError('Could not validate video duration');
        event.target.value = '';
      } finally {
        URL.revokeObjectURL(video.src);
      }
      return;
    }

    // Add new image files and their previews
    setSelectedFiles(prevFiles => {
      const updatedFiles = [...prevFiles, ...newFiles];
      return updatedFiles;
    });

    // Add new image previews
    setPreviews(prevPreviews => [
      ...prevPreviews,
      ...newFiles.map(file => ({
        id: URL.createObjectURL(file),
        url: URL.createObjectURL(file),
        type: 'image'
      }))
    ]);
  };

  const triggerFileInput = (accept) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (typeof onSubmit === 'function') {
        const result = await onSubmit({
          ...values,
          files: selectedFiles
        });
        
        if (result?.error) {
          await Swal.fire({
            title: 'Error',
            text: result.message || 'Failed to submit post',
            icon: 'error',
            confirmButtonColor: '#0a66c2'
          });
          return;
        }

        await Swal.fire({
          title: 'Success',
          text: 'Post created successfully',
          icon: 'success',
          confirmButtonColor: '#0a66c2'
        });

        if (!isEdit) {
          setSelectedFiles([]);
          setPreviews([]);
        }
        setFileError(null);
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      await Swal.fire({
        title: 'Error',
        text: 'Failed to submit post. Please try again.',
        icon: 'error',
        confirmButtonColor: '#0a66c2'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{
        description: initialValues?.description || '',
        tags: initialValues?.tags?.join(', ') || '',
      }}
      validationSchema={postValidationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, values }) => (
        <Form className="bg-white rounded-lg overflow-hidden max-w-xl w-full mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              {isEdit ? "Edit Post" : "Create a post"}
            </h2>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* User Info */}
          <div className="px-6 py-4 flex items-center">
            <img 
              src={avatarError ? defaultUserAvatar : (user?.profilePicture ? getMediaUrl(user.profilePicture) : defaultUserAvatar)} 
              alt={user?.name || "Profile"}
              className="w-10 h-10 rounded-full object-cover mr-3"
              onError={() => setAvatarError(true)}
            />
            <div>
              <div className="font-medium">{user?.name || "User"}</div>
              <div className="text-xs text-gray-500">{`@${user?.username ?? ""}`}</div>
            </div>
          </div>

          {/* Main content */}
          <div className="px-6 pt-2 pb-4">
            {fileError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm flex items-start">
                <FiInfo className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            <Field
              as="textarea"
              id="description"
              name="description"
              className="w-full border-0 focus:ring-0 text-base placeholder-gray-400 resize-none p-0 focus:outline-none"
              placeholder="What do you want to talk about?"
              style={{ minHeight: "100px" }}
            />
            <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />

            <div className="mt-4">
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
            <div className="px-6 py-2">
              <div className={`grid ${previews.length > 1 ? 'grid-cols-2 gap-3' : 'grid-cols-1'} rounded-lg overflow-hidden`}>
                {previews.map((preview, index) => (
                  <div key={preview.id} className="relative rounded-md overflow-hidden bg-gray-50 aspect-video">
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
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 p-1 bg-gray-800/70 text-white rounded-full hover:bg-black/80"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            id="files"
            className="hidden"
            multiple
            accept="image/*, video/mp4"
            onChange={handleFileChange}
          />

          {/* Footer with options and submit button */}
          <div className="flex flex-col border-t border-gray-200">
            {/* Media buttons */}
            <div className="flex items-center gap-2 px-6 py-3">
              <button
                type="button"
                onClick={() => triggerFileInput("image/*")}
                className="flex items-center justify-center px-3 py-1"
              >
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="ml-2 text-sm font-medium">Photo</span>
              </button>
              
              <button
                type="button"
                onClick={() => triggerFileInput("video/mp4")}
                className="flex items-center justify-center px-3 py-1"
              >
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="ml-2 text-sm font-medium">Video</span>
              </button>
              
              <button
                type="button"
                className="flex items-center justify-center px-3 py-1"
              >
                <FiSmile className="w-5 h-5 text-yellow-500" />
                <span className="ml-2 text-sm font-medium">Emoji</span>
              </button>
              
              <div className="ml-auto text-xs text-gray-500">
                {values?.description?.length || 0}/1000
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-6 py-3 flex justify-end gap-3 bg-gray-50">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !values.description.trim()}
                className={`px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 ${
                  isSubmitting || !values.description.trim() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Posting...
                  </span>
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default PostForm;