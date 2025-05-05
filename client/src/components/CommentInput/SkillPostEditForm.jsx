import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];

const skillPostValidationSchema = Yup.object().shape({
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters long'),
  tags: Yup.string()
    .matches(/^(\w+)(,\s*\w+)*$/, 'Tags must be comma-separated words')
    .nullable(),
  files: Yup.mixed()
    .test('fileType', 'Only images or videos are allowed', (files) => {
      if (!files || files.length === 0) return true; // No files uploaded
      return Array.from(files).every((file) => SUPPORTED_FORMATS.includes(file.type));
    })
    .test('fileCount', 'You can upload a maximum of 3 images or 1 video', (files) => {
      if (!files || files.length === 0) return true; // No files uploaded
      const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
      const videoFiles = Array.from(files).filter((file) => file.type.startsWith('video/'));
      return (imageFiles.length <= 3 && videoFiles.length === 0) || (videoFiles.length === 1 && imageFiles.length === 0);
    }),
});
const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

const SkillPostEditForm = ({ postId, initialData, onSubmitSuccess }) => {
  const handleSubmit = async (values, { setSubmitting }) => {
    const formData = new FormData();
    formData.append('description', values.description);
    formData.append('tags', values.tags);
    if (values.files) {
      Array.from(values.files).forEach((file) => formData.append('mediaFiles', file));
    }

    try {
      const response = await axios.put(`/api/v1/skillposts/${postId}`, formData, {
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
        files: null,
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

          {/* File Upload Field */}
          <div>
            <label htmlFor="files" className="block text-sm font-medium text-gray-700">
              Upload Images or Video
            </label>
            <input
              id="files"
              name="files"
              type="file"
              accept="image/*,video/mp4"
              multiple
              onChange={(event) => setFieldValue('files', event.currentTarget.files)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <ErrorMessage name="files" component="div" className="text-red-500 text-sm mt-1" />
          </div>

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