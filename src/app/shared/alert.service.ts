import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private toastBase = {
    toast: true,
    position: 'bottom-end' as const,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    color: '#333', // Text color
    iconColor: '#333', // Default icon color
  };

  success(message: string = 'Success!') {
    Swal.fire({
      ...this.toastBase,
      background: '#e6fffa', // soft mint green
      icon: 'success',
      title: message,
      iconColor: '#2ecc71', // bright green
    });
  }

  error(message: string = 'Something went wrong') {
    Swal.fire({
      ...this.toastBase,
      background: '#ffe6e6', // soft red/pink
      icon: 'error',
      title: message,
      iconColor: '#e74c3c', // strong red
    });
  }

  info(message: string) {
    Swal.fire({
      ...this.toastBase,
      background: '#e8f4ff', // soft blue
      icon: 'info',
      title: message,
      iconColor: '#3498db', // vibrant blue
    });
  }

  confirm(message: string, title: string = 'Are you sure?') {
    return Swal.fire({
      title,
      text: message,
      icon: 'warning',
      iconColor: '#f39c12', // amber/orange
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#28a745', // green
      cancelButtonColor: '#dc3545', // red
      background: '#fff8e1', // light warm background
      color: '#444', // dark readable text
    });
  }
}
