import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';

const MAX_IMAGES = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_DURATION = 30; // seconds

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
            confirmButtonColor: '#3085d6'
          });
          return;
        }

        await Swal.fire({
          title: 'Success',
          text: 'Post created successfully',
          icon: 'success',
          confirmButtonColor: '#3085d6'
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
        confirmButtonColor: '#3085d6'
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
      {({ isSubmitting }) => (
        <Form className="bg-white p-8 rounded-xl shadow-lg space-y-6 max-w-2xl mx-auto">
          <div className="border-b pb-4 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Create New Post</h2>
            <p className="text-sm text-gray-500 mt-1">Share your thoughts and media with your network</p>
          </div>

          {fileError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{fileError}</span>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Field
              as="textarea"
              id="description"
              name="description"
              rows="4"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-150 ease-in-out"
              placeholder="What's on your mind?"
            />
            <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div className="space-y-2">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags
              <span className="text-gray-400 ml-2 font-normal">(separated by commas)</span>
            </label>
            <Field
              type="text"
              id="tags"
              name="tags"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-150 ease-in-out"
              placeholder="e.g., javascript, react, webdev"
            />
            <ErrorMessage name="tags" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Media Files
            </label>
            <div className="mt-1">
              <input
                type="file"
                id="files"
                multiple
                accept="image/*, video/mp4"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none"
              />
            </div>
            
            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {previews.map((preview, index) => (
                  <div key={preview.id} className="relative group">
                    <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100">
                      {preview.type === 'video' ? (
                        <video 
                          src={preview.url} 
                          className="w-full h-full object-cover rounded-lg"
                          controls
                        />
                      ) : (
                        <img 
                          src={preview.url} 
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 rounded-full shadow-sm transition-all duration-200 backdrop-blur-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-sm text-gray-500 mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Upload up to 3 images (JPEG, PNG, GIF) or 1 video (MP4). Max 10MB each.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t mt-8">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Post'
              )}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default PostForm;