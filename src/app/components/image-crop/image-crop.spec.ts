import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';

import { ImageCropComponent } from './image-crop';

// Mock classes
class MockMatDialogRef {
  close = jasmine.createSpy('close');
}

class MockChangeDetectorRef {
  detectChanges = jasmine.createSpy('detectChanges');
}

describe('ImageCropComponent', () => {
  let component: ImageCropComponent;
  let fixture: ComponentFixture<ImageCropComponent>;
  let mockDialogRef: MockMatDialogRef;
  let mockCdr: MockChangeDetectorRef;

  const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
  const mockDialogData = { file: mockFile };

  beforeEach(async () => {
    mockDialogRef = new MockMatDialogRef();
    mockCdr = new MockChangeDetectorRef();

    await TestBed.configureTestingModule({
      imports: [ImageCropComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: ChangeDetectorRef, useValue: mockCdr },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageCropComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with dialog data', () => {
      expect(component.data).toEqual(mockDialogData);
    });

    it('should initialize with null cropped event', () => {
      expect(component.croppedEvent).toBeNull();
    });

    // ✅ Use fakeAsync only
    it('should run after delay', fakeAsync(() => {
      tick(500);
      expect(true).toBeTrue();
    }));
  });

  describe('Image Cropping', () => {
    it('should handle image cropped event', () => {
      const mockCroppedEvent: ImageCroppedEvent = {
        base64: 'data:image/png;base64,test',
        blob: new Blob(['test'], { type: 'image/png' }),
        width: 100,
        height: 100,
        cropperPosition: { x1: 0, y1: 0, x2: 100, y2: 100 },
        imagePosition: { x1: 0, y1: 0, x2: 100, y2: 100 },
      };
      spyOn(console, 'log');

      component.onImageCropped(mockCroppedEvent);

      expect(console.log).toHaveBeenCalledWith(
        '📸 Cropped Event:',
        mockCroppedEvent
      );
      expect(component.croppedEvent).toEqual(mockCroppedEvent);
    });

    it('should store cropped event data', () => {
      const mockCroppedEvent: ImageCroppedEvent = {
        base64: 'data:image/png;base64,test',
        blob: new Blob(['test'], { type: 'image/png' }),
        width: 200,
        height: 150,
        cropperPosition: { x1: 10, y1: 10, x2: 210, y2: 160 },
        imagePosition: { x1: 10, y1: 10, x2: 210, y2: 160 },
      };

      component.onImageCropped(mockCroppedEvent);

      expect(component.croppedEvent?.base64).toBe('data:image/png;base64,test');
      expect(component.croppedEvent?.blob).toEqual(jasmine.any(Blob));
      expect(component.croppedEvent?.width).toBe(200);
      expect(component.croppedEvent?.height).toBe(150);
    });
  });

  describe('Dialog Actions', () => {
    it('should close dialog without data', () => {
      component.onClose();

      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });

    it('should accept cropped image and close dialog with data', (done) => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      const mockCroppedEvent: ImageCroppedEvent = {
        base64: 'data:image/png;base64,test',
        blob: mockBlob,
        width: 100,
        height: 100,
        cropperPosition: { x1: 0, y1: 0, x2: 100, y2: 100 },
        imagePosition: { x1: 0, y1: 0, x2: 100, y2: 100 },
      };

      component.croppedEvent = mockCroppedEvent;

      // Mock FileReader
      const mockFileReader = {
        onload: null as any,
        readAsDataURL: jasmine
          .createSpy('readAsDataURL')
          .and.callFake(function (this: any) {
            setTimeout(() => {
              this.result = 'data:image/png;base64,test';
              if (this.onload) this.onload();
            }, 0);
          }),
      };
      spyOn(window, 'FileReader').and.returnValue(mockFileReader as any);

      component.onAccept();

      setTimeout(() => {
        expect(mockDialogRef.close).toHaveBeenCalledWith({
          file: jasmine.any(File),
          objectUrl: 'data:image/png;base64,test',
        });
        done();
      }, 10);
    });

    it('should warn and return if no cropped image available', () => {
      spyOn(console, 'warn');
      component.croppedEvent = null;

      component.onAccept();

      expect(console.warn).toHaveBeenCalledWith(
        '❌ No cropped image available'
      );
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should warn and return if no blob in cropped event', () => {
      spyOn(console, 'warn');
      component.croppedEvent = {
        base64: 'data:image/png;base64,test',
        blob: null,
        width: 100,
        height: 100,
        cropperPosition: { x1: 0, y1: 0, x2: 100, y2: 100 },
      } as any;

      component.onAccept();

      expect(console.warn).toHaveBeenCalledWith(
        '❌ No cropped image available'
      );
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('File Handling', () => {
    it('should create file with correct name and type', (done) => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      const mockCroppedEvent: ImageCroppedEvent = {
        base64: 'data:image/png;base64,test',
        blob: mockBlob,
        width: 100,
        height: 100,
        cropperPosition: { x1: 0, y1: 0, x2: 100, y2: 100 },
        imagePosition: { x1: 0, y1: 0, x2: 100, y2: 100 },
      };

      component.croppedEvent = mockCroppedEvent;

      // Mock FileReader
      const mockFileReader = {
        onload: null as any,
        readAsDataURL: jasmine
          .createSpy('readAsDataURL')
          .and.callFake(function (this: any) {
            setTimeout(() => {
              this.result = 'data:image/png;base64,test';
              if (this.onload) this.onload();
            }, 0);
          }),
      };
      spyOn(window, 'FileReader').and.returnValue(mockFileReader as any);

      component.onAccept();

      setTimeout(() => {
        const callArgs = mockDialogRef.close.calls.mostRecent().args[0];
        expect(callArgs.file.name).toBe('profile.png');
        expect(callArgs.file.type).toBe('image/png');
        done();
      }, 10);
    });

    it('should handle different blob types', (done) => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
      const mockCroppedEvent: ImageCroppedEvent = {
        base64: 'data:image/jpeg;base64,test',
        blob: mockBlob,
        width: 100,
        height: 100,
        cropperPosition: { x1: 0, y1: 0, x2: 100, y2: 100 },
        imagePosition: { x1: 0, y1: 0, x2: 100, y2: 100 },
      };

      component.croppedEvent = mockCroppedEvent;

      // Mock FileReader
      const mockFileReader = {
        onload: null as any,
        readAsDataURL: jasmine
          .createSpy('readAsDataURL')
          .and.callFake(function (this: any) {
            setTimeout(() => {
              this.result = 'data:image/jpeg;base64,test';
              if (this.onload) this.onload();
            }, 0);
          }),
      };
      spyOn(window, 'FileReader').and.returnValue(mockFileReader as any);

      component.onAccept();

      setTimeout(() => {
        const callArgs = mockDialogRef.close.calls.mostRecent().args[0];
        expect(callArgs.file.type).toBe('image/jpeg');
        done();
      }, 10);
    });
  });

  describe('Integration Tests', () => {
    it('should complete full crop and accept flow', (done) => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      const mockCroppedEvent: ImageCroppedEvent = {
        base64: 'data:image/png;base64,test',
        blob: mockBlob,
        width: 100,
        height: 100,
        cropperPosition: { x1: 0, y1: 0, x2: 100, y2: 100 },
        imagePosition: { x1: 0, y1: 0, x2: 100, y2: 100 },
      };

      // Mock FileReader
      const mockFileReader = {
        onload: null as any,
        readAsDataURL: jasmine
          .createSpy('readAsDataURL')
          .and.callFake(function (this: any) {
            setTimeout(() => {
              this.result = 'data:image/png;base64,test';
              if (this.onload) this.onload();
            }, 0);
          }),
      };
      spyOn(window, 'FileReader').and.returnValue(mockFileReader as any);

      // Simulate cropping
      component.onImageCropped(mockCroppedEvent);
      expect(component.croppedEvent).toEqual(mockCroppedEvent);

      // Accept the cropped image
      component.onAccept();

      setTimeout(() => {
        expect(mockDialogRef.close).toHaveBeenCalledWith({
          file: jasmine.any(File),
          objectUrl: 'data:image/png;base64,test',
        });
        done();
      }, 10);
    });

    it('should handle crop and close flow', () => {
      const mockCroppedEvent: ImageCroppedEvent = {
        base64: 'data:image/png;base64,test',
        blob: new Blob(['test'], { type: 'image/png' }),
        width: 100,
        height: 100,
        cropperPosition: { x1: 0, y1: 0, x2: 100, y2: 100 },
        imagePosition: { x1: 0, y1: 0, x2: 100, y2: 100 },
      };

      // Simulate cropping
      component.onImageCropped(mockCroppedEvent);
      expect(component.croppedEvent).toEqual(mockCroppedEvent);

      // Close without accepting
      component.onClose();
      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });
  });

  describe('Error Scenarios', () => {
    it('should handle FileReader error gracefully', (done) => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      const mockCroppedEvent: ImageCroppedEvent = {
        base64: 'data:image/png;base64,test',
        blob: mockBlob,
        width: 100,
        height: 100,
        cropperPosition: { x1: 0, y1: 0, x2: 100, y2: 100 },
        imagePosition: { x1: 0, y1: 0, x2: 100, y2: 100 },
      };

      component.croppedEvent = mockCroppedEvent;

      // Mock FileReader with error
      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        readAsDataURL: jasmine
          .createSpy('readAsDataURL')
          .and.callFake(function (this: any) {
            setTimeout(() => {
              if (this.onerror) this.onerror(new Error('FileReader error'));
            }, 0);
          }),
      };
      spyOn(window, 'FileReader').and.returnValue(mockFileReader as any);

      component.onAccept();

      setTimeout(() => {
        // Should not close dialog on error
        expect(mockDialogRef.close).not.toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should handle invalid cropped event data', () => {
      const invalidCroppedEvent = {
        base64: null,
        blob: null,
        width: 0,
        height: 0,
        cropperPosition: null,
      } as any;

      spyOn(console, 'warn');
      component.croppedEvent = invalidCroppedEvent;

      component.onAccept();

      expect(console.warn).toHaveBeenCalledWith(
        '❌ No cropped image available'
      );
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should handle undefined cropped event', () => {
      spyOn(console, 'warn');
      component.croppedEvent = undefined as any;

      component.onAccept();

      expect(console.warn).toHaveBeenCalledWith(
        '❌ No cropped image available'
      );
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large images', () => {
      const mockCroppedEvent: ImageCroppedEvent = {
        base64: 'data:image/png;base64,test',
        blob: new Blob(['test'], { type: 'image/png' }),
        width: 4000,
        height: 3000,
        cropperPosition: { x1: 0, y1: 0, x2: 4000, y2: 3000 },
        imagePosition: { x1: 0, y1: 0, x2: 4000, y2: 3000 },
      };

      component.onImageCropped(mockCroppedEvent);

      expect(component.croppedEvent?.width).toBe(4000);
      expect(component.croppedEvent?.height).toBe(3000);
    });

    it('should handle very small images', () => {
      const mockCroppedEvent: ImageCroppedEvent = {
        base64: 'data:image/png;base64,test',
        blob: new Blob(['test'], { type: 'image/png' }),
        width: 10,
        height: 10,
        cropperPosition: { x1: 0, y1: 0, x2: 10, y2: 10 },
        imagePosition: { x1: 0, y1: 0, x2: 10, y2: 10 },
      };

      component.onImageCropped(mockCroppedEvent);

      expect(component.croppedEvent?.width).toBe(10);
      expect(component.croppedEvent?.height).toBe(10);
    });

    it('should handle different image formats', () => {
      const formats = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

      formats.forEach((format) => {
        const mockCroppedEvent: ImageCroppedEvent = {
          base64: `data:${format};base64,test`,
          blob: new Blob(['test'], { type: format }),
          width: 100,
          height: 100,
          cropperPosition: { x1: 0, y1: 0, x2: 100, y2: 100 },
          imagePosition: { x1: 0, y1: 0, x2: 100, y2: 100 },
        };

        component.onImageCropped(mockCroppedEvent);
        expect(component.croppedEvent?.blob?.type).toBe(format);
      });
    });

    it('should handle multiple crop operations', () => {
      const firstCrop: ImageCroppedEvent = {
        base64: 'data:image/png;base64,first',
        blob: new Blob(['first'], { type: 'image/png' }),
        width: 100,
        height: 100,
        cropperPosition: { x1: 0, y1: 0, x2: 100, y2: 100 },
        imagePosition: { x1: 0, y1: 0, x2: 100, y2: 100 },
      };

      const secondCrop: ImageCroppedEvent = {
        base64: 'data:image/png;base64,second',
        blob: new Blob(['second'], { type: 'image/png' }),
        width: 150,
        height: 150,
        cropperPosition: { x1: 0, y1: 0, x2: 150, y2: 150 },
        imagePosition: { x1: 0, y1: 0, x2: 150, y2: 150 },
      };

      component.onImageCropped(firstCrop);
      expect(component.croppedEvent).toEqual(firstCrop);

      component.onImageCropped(secondCrop);
      expect(component.croppedEvent).toEqual(secondCrop);
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle component destruction gracefully', () => {
      // Set up component state
      component.croppedEvent = {
        base64: 'data:image/png;base64,test',
        blob: new Blob(['test'], { type: 'image/png' }),
        width: 100,
        height: 100,
        cropperPosition: { x1: 0, y1: 0, x2: 100, y2: 100 },
        imagePosition: { x1: 0, y1: 0, x2: 100, y2: 100 },
      };

      // Destroy component
      fixture.destroy();

      // Should not throw errors
      expect(() => component.onClose()).not.toThrow();
    });
  });
});
