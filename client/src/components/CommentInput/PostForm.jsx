import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const MAX_IMAGES = 3;

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

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (typeof onSubmit === 'function') {
        await onSubmit({
          ...values,
          files: selectedFiles
        });
        if (!isEdit) {
          setSelectedFiles([]);
        }
      }
    } catch (error) {
      console.error('Error submitting post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.currentTarget.files);
    
    // Check if we have any videos
    const hasVideo = newFiles.some(file => file.type.startsWith('video/'));
    const hasExistingVideo = selectedFiles.some(file => file.type.startsWith('video/'));
    const currentImages = selectedFiles.filter(file => file.type.startsWith('image/'));
    
    // Prevent mixing videos and images
    if (hasVideo && selectedFiles.length > 0) {
      alert('You can only upload either images or a video, not both');
      return;
    }
    
    if (hasExistingVideo) {
      alert('Please remove the existing video before uploading new files');
      return;
    }

    // Handle video upload
    if (hasVideo) {
      if (newFiles.length > 1) {
        alert('You can only upload 1 video');
        return;
      }
      setSelectedFiles([newFiles[0]]);
      return;
    }

    // Handle image upload
    const totalImageCount = currentImages.length + newFiles.length;
    if (totalImageCount > MAX_IMAGES) {
      alert(`You can only upload up to ${MAX_IMAGES} images`);
      return;
    }

    setSelectedFiles(prevFiles => {
      const updatedFiles = [...prevFiles, ...newFiles];
      return updatedFiles.slice(0, MAX_IMAGES); // Ensure we don't exceed MAX_IMAGES
    });
  };

  const removeFile = (index) => {
    setSelectedFiles(prevFiles => {
      const updatedFiles = [...prevFiles];
      updatedFiles.splice(index, 1);
      return updatedFiles;
    });
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
        <Form className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <Field
              as="textarea"
              id="description"
              name="description"
              rows="4"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Share your thoughts..."
            />
            <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags
            </label>
            <Field
              type="text"
              id="tags"
              name="tags"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter tags separated by commas (e.g., javascript, react, webdev)"
            />
            <ErrorMessage name="tags" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div>
            <label htmlFor="files" className="block text-sm font-medium text-gray-700">
              Media Files
            </label>
            <input
              type="file"
              id="files"
              multiple
              accept="image/*, video/mp4"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <div className="mt-2">
              {selectedFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <div className="border rounded p-2 flex items-center">
                        <span className="truncate text-xs">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                          title="Remove file"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Upload up to 3 images (JPEG, PNG, GIF) or 1 video (MP4). Max 10MB each.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default PostForm;