import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];

const postValidationSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  content: Yup.string()
    .required('Content is required')
    .min(10, 'Content must be at least 10 characters long'),
  hashtags: Yup.string()
    .matches(/^#(\w+)( #\w+)*$/, 'Hashtags must start with # and be space-separated')
    .nullable(),
  files: Yup.mixed()
    .test('fileType', 'Only images or videos are allowed', (files) => {
      if (!files || files.length === 0) return true;
      return Array.from(files).every((file) => SUPPORTED_FORMATS.includes(file.type));
    })
    .test('fileCount', 'You can upload a maximum of 3 images or 1 video', (files) => {
      if (!files || files.length === 0) return true;
      const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
      const videoFiles = Array.from(files).filter((file) => file.type.startsWith('video/'));
      return (imageFiles.length <= 3 && videoFiles.length === 0) || (videoFiles.length === 1 && imageFiles.length === 0);
    })
    .test('videoDuration', 'Video duration cannot exceed 30 seconds', async (files) => {
      if (!files || files.length === 0) return true;
      const videoFile = Array.from(files).find((file) => file.type.startsWith('video/'));
      if (videoFile) {
        const videoDuration = await getVideoDuration(videoFile);
        return videoDuration <= 30;
      }
      return true;
    }),
});

const getVideoDuration = (file) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.src = URL.createObjectURL(file);
  });
};

const PostForm = ({ onSubmit }) => {
  return (
    <Formik
      initialValues={{
        title: '',
        content: '',
        hashtags: '',
        files: null,
      }}
      validationSchema={postValidationSchema}
      onSubmit={onSubmit}
    >
      {({ setFieldValue, isSubmitting }) => (
        <Form className="bg-white p-4 rounded-lg shadow-md space-y-4">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <Field
              id="title"
              name="title"
              type="text"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter post title"
            />
            <ErrorMessage name="title" component="div" className="text-red-500 text-sm mt-1" />
          </div>

          {/* Content Field */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <Field
              id="content"
              name="content"
              as="textarea"
              rows="4"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Write your post content here..."
            />
            <ErrorMessage name="content" component="div" className="text-red-500 text-sm mt-1" />
          </div>

          {/* Hashtags Field */}
          <div>
            <label htmlFor="hashtags" className="block text-sm font-medium text-gray-700">
              Hashtags
            </label>
            <Field
              id="hashtags"
              name="hashtags"
              type="text"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., #react #javascript"
            />
            <ErrorMessage name="hashtags" component="div" className="text-red-500 text-sm mt-1" />
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
              {isSubmitting ? 'Submitting...' : 'Create Post'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default PostForm;