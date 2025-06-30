import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  ViewChild,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-crop',
  standalone: true,
  imports: [CommonModule, MatButtonModule, FormsModule, ImageCropperComponent],
  templateUrl: './image-crop.html',
  styleUrls: ['./image-crop.css'],
})
export class ImageCropComponent implements AfterViewInit {
  @ViewChild(ImageCropperComponent)
  imageCropper!: ImageCropperComponent;

  croppedEvent: ImageCroppedEvent | null = null; // ✅ Store the full cropped event

  constructor(
    public dialogRef: MatDialogRef<ImageCropComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { file: File },
    private cdRef: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    // Fix ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => this.cdRef.detectChanges(), 0);
  }

  onImageCropped(event: ImageCroppedEvent): void {
    console.log('📸 Cropped Event:', event);
    this.croppedEvent = event;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onAccept(): void {
    if (!this.croppedEvent?.blob) {
      console.warn('❌ No cropped image available');
      return;
    }

    const file = new File([this.croppedEvent.blob], 'profile.png', {
      type: this.croppedEvent.blob.type,
    });

    const reader = new FileReader();
    reader.onload = () => {
      const objectUrl = reader.result as string;
      this.dialogRef.close({ file, objectUrl });
    };
    reader.readAsDataURL(file);
  }
}
