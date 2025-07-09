import { TestBed } from '@angular/core/testing';
import { AlertService } from './alert.service';
import Swal from 'sweetalert2';

describe('AlertService', () => {
  let service: AlertService;
  let swalSpy: jest.SpyInstance;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AlertService],
    });
    service = TestBed.inject(AlertService);

    // Create spy for Swal.fire
    swalSpy = jest.spyOn(Swal, 'fire').mockResolvedValue({} as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('success', () => {
    it('should show success alert with default message', () => {
      service.success();

      expect(swalSpy).toHaveBeenCalledWith({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        color: '#333',
        iconColor: '#2ecc71',
        background: '#e6fffa',
        icon: 'success',
        title: 'Success!',
      });
    });

    it('should show success alert with custom message', () => {
      const customMessage = 'Operation completed successfully!';

      service.success(customMessage);

      expect(swalSpy).toHaveBeenCalledWith({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        color: '#333',
        iconColor: '#2ecc71',
        background: '#e6fffa',
        icon: 'success',
        title: customMessage,
      });
    });
  });

  describe('error', () => {
    it('should show error alert with default message', () => {
      service.error();

      expect(swalSpy).toHaveBeenCalledWith({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        color: '#333',
        iconColor: '#e74c3c',
        background: '#ffe6e6',
        icon: 'error',
        title: 'Something went wrong',
      });
    });

    it('should show error alert with custom message', () => {
      const customMessage = 'Failed to save data';

      service.error(customMessage);

      expect(swalSpy).toHaveBeenCalledWith({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        color: '#333',
        iconColor: '#e74c3c',
        background: '#ffe6e6',
        icon: 'error',
        title: customMessage,
      });
    });
  });

  describe('info', () => {
    it('should show info alert with message', () => {
      const message = 'This is an information message';

      service.info(message);

      expect(swalSpy).toHaveBeenCalledWith({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        color: '#333',
        iconColor: '#3498db',
        background: '#e8f4ff',
        icon: 'info',
        title: message,
      });
    });
  });

  describe('confirm', () => {
    it('should show confirmation dialog with default title', () => {
      const message = 'Do you want to delete this item?';

      service.confirm(message);

      expect(swalSpy).toHaveBeenCalledWith({
        title: 'Are you sure?',
        text: message,
        icon: 'warning',
        iconColor: '#f39c12',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#dc3545',
        background: '#fff8e1',
        color: '#444',
      });
    });

    it('should show confirmation dialog with custom title', () => {
      const message = 'This action cannot be undone';
      const title = 'Delete permanently?';

      service.confirm(message, title);

      expect(swalSpy).toHaveBeenCalledWith({
        title: title,
        text: message,
        icon: 'warning',
        iconColor: '#f39c12',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#dc3545',
        background: '#fff8e1',
        color: '#444',
      });
    });

    it('should return the result from Swal.fire', async () => {
      const message = 'Confirm action';
      const mockResult = {
        isConfirmed: true,
        isDenied: false,
        isDismissed: false,
      };
      swalSpy.mockResolvedValue(mockResult as any);

      const result = service.confirm(message);
      const actualResult = await result;

      expect(actualResult).toEqual(mockResult);
    });
  });

  describe('integration tests', () => {
    it('should call different alert types in sequence', () => {
      service.success('Success message');
      service.error('Error message');
      service.info('Info message');
      service.confirm('Confirm message');

      expect(swalSpy).toHaveBeenCalledTimes(4);
    });

    it('should maintain consistent base configuration across all toast types', () => {
      service.success();
      service.error();
      service.info('test');

      // Check that all calls include the base toast configuration
      const calls = swalSpy.mock.calls;

      calls.slice(0, 3).forEach((call: any[]) => {
        const config = call[0];
        expect(config.toast).toBe(true);
        expect(config.position).toBe('bottom-end');
        expect(config.showConfirmButton).toBe(false);
        expect(config.timer).toBe(3000);
        expect(config.timerProgressBar).toBe(true);
        expect(config.color).toBe('#333');
      });
    });
  });
});
