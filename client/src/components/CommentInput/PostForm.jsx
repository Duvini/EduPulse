import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const postValidationSchema = Yup.object().shape({
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters long'),
  tags: Yup.string()
    .matches(/^(\w+)(,\s*\w+)*$/, 'Tags must be comma-separated words')
    .nullable(),
  mediaFiles: Yup.array()
    .test('fileType', 'Unsupported file format', (files) => {
      if (!files || files.length === 0) return true;
      return files.every(file => SUPPORTED_FORMATS.includes(file.type));
    })
    .test('fileSize', 'File too large (max 10MB)', (files) => {
      if (!files || files.length === 0) return true;
      return files.every(file => file.size <= MAX_FILE_SIZE);
    })
    .test('fileCount', 'Maximum 3 images or 1 video allowed', (files) => {
      if (!files || files.length === 0) return true;
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      const videoFiles = files.filter(file => file.type.startsWith('video/'));
      return (imageFiles.length <= 3 && videoFiles.length === 0) || 
             (videoFiles.length === 1 && imageFiles.length === 0);
    })
});

const PostForm = ({ initialValues, onSubmit, onCancel, isEdit = false }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const submitValues = {
        ...values,
        mediaFiles: selectedFiles
      };
      
      if (typeof onSubmit === 'function') {
        await onSubmit(submitValues);
        if (!isEdit) {
          resetForm();
          setSelectedFiles([]);
        }
      } else {
        console.error('onSubmit is not a function');
      }
    } catch (error) {
      console.error('Error submitting post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.currentTarget.files);
    setSelectedFiles(prevFiles => {
      // Combine previous files with new files
      const updatedFiles = [...prevFiles, ...newFiles];
      
      // Check if we have videos
      const hasVideo = updatedFiles.some(file => file.type.startsWith('video/'));
      
      // If we have a video, only keep the first video
      if (hasVideo) {
        const firstVideo = updatedFiles.find(file => file.type.startsWith('video/'));
        return [firstVideo];
      }
      
      // For images, limit to 3 most recent
      const imageFiles = updatedFiles.filter(file => file.type.startsWith('image/'));
      return imageFiles.slice(-3); // Keep only the 3 most recent images
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
        mediaFiles: []
      }}
      validationSchema={postValidationSchema}
      onSubmit={handleSubmit}
    >
      {({ setFieldValue, isSubmitting }) => (
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
            <ErrorMessage name="mediaFiles" component="div" className="mt-1 text-sm text-red-600" />
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
              {isSubmitting ? 'Submitting...' : isEdit ? 'Update Post' : 'Create Post'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default PostForm;