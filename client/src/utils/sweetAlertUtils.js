import Swal from 'sweetalert2';

export const showSuccessAlert = (message) => {
  Swal.fire({
    title: 'Success',
    text: message,
    icon: 'success',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      container: 'sweet-alert-success'
    }
  });
};

export const showErrorAlert = (message) => {
  Swal.fire({
    title: 'Error',
    text: message,
    icon: 'error',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      container: 'sweet-alert-error'
    }
  });
};