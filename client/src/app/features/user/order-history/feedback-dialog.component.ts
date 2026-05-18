import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Order, OrderItem } from '../../../core/models/order.model';

@Component({
  selector: 'app-feedback-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div class="feedback-dialog">
      <h2 mat-dialog-title>Rate Your Order</h2>
      <p class="order-ref">{{ data.orderItem.foodItem.name }} · Order #{{ data.orderItem.order.id }}</p>

      <div class="stars">
        @for (star of [1,2,3,4,5]; track star) {
          <button class="star-btn" (click)="rating = star">
            <mat-icon [style.color]="star <= rating ? '#ffa000' : '#ddd'">
              {{ star <= rating ? 'star' : 'star_border' }}
            </mat-icon>
          </button>
        }
      </div>
      <p class="rating-label">{{ ratingLabel }}</p>

      <mat-form-field appearance="outline" class="comment-field">
        <mat-label>Your feedback (optional)</mat-label>
        <textarea matInput [(ngModel)]="comment" rows="3" placeholder="Tell us about your experience..."></textarea>
      </mat-form-field>

      <div class="dialog-actions">
        <button mat-button mat-dialog-close>Skip</button>
        <button mat-flat-button class="submit-btn" (click)="submit()" [disabled]="rating === 0">
          Submit Feedback
        </button>
      </div>
    </div>
  `,
  styles: [`
    .feedback-dialog {
      padding: 8px 16px 16px;
      text-align: center;

      h2 { font-size: 20px; font-weight: 700; margin: 0 0 4px; }
      .order-ref { color: #888; font-size: 13px; margin-bottom: 20px; }
    }
    .stars {
      display: flex;
      justify-content: center;
      gap: 4px;
      margin-bottom: 8px;
      .star-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        mat-icon { font-size: 36px; width: 36px; height: 36px; }
      }
    }
    .rating-label { font-size: 14px; color: #666; margin-bottom: 16px; font-weight: 500; }
    .comment-field { width: 100%; }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 8px;
    }
    .submit-btn {
      background: #ff6f00 !important;
      color: white !important;
      border-radius: 8px !important;
    }
  `],
})
export class FeedbackDialogComponent {
  rating = 0;
  comment = '';

  labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  get ratingLabel(): string { return this.labels[this.rating] || 'Select a rating'; }

  constructor(
    public dialogRef: MatDialogRef<FeedbackDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { orderItem: OrderItem }
  ) {}

  submit(): void {
    this.dialogRef.close({ rating: this.rating, comment: this.comment });
  }
}
