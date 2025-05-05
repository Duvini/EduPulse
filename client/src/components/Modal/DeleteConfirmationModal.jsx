import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import Modal from './Modal';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <FiAlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
          <h3 className="text-lg font-medium text-gray-900">
            {title || 'Delete Post'}
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {message || 'Are you sure you want to delete this post? This action cannot be undone.'}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={onConfirm}
        >
          Delete
        </button>
        <button
          type="button"
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;