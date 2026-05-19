import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';

import { VendorService } from '../../../core/services/vendor.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FoodItem } from '../../../core/models/food-item.model';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatChipsModule,
    MatTableModule,
  ],
  templateUrl: './menu-management.component.html',
  styleUrl: './menu-management.component.scss',
})
export class MenuManagementComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  menuItems = signal<FoodItem[]>([]);
  editingItem = signal<FoodItem | null>(null);
  showForm = signal(false);

  private failedFoodIds = new Set<number>();

  foodImgSrc(id: number): string {
    return this.failedFoodIds.has(id)
      ? '/food_placeholder.webp'
      : this.vendor.getFoodItemImageUrl(id);
  }
  onFoodImgError(id: number, el: EventTarget | null): void {
    this.failedFoodIds.add(id);
    if (el) (el as HTMLImageElement).src = '/food_placeholder.webp';
  }

  categories = ['Starters', 'Main Course', 'Snacks', 'Beverages', 'Desserts', 'Combos'];
  shopId = 0;

  form: FormGroup;

  constructor(
    readonly vendor: VendorService,
    private notify: NotificationService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(1)]],
      stockQuantity: [50, [Validators.required, Validators.min(0)]],
      prepTimeMins: [10, Validators.required],
      isVeg: [true],
    });
  }

  ngOnInit(): void {
    this.vendor.getMyShop().subscribe({
      next: (myShop) => {
        this.shopId = myShop?.id ?? 0;
        this.loadMenu();
      },
      error: () => this.loading.set(false),
    });
  }

  loadMenu(): void {
    // GET /api/food-items/shop/{shopId}
    this.vendor.getMenuByShop(this.shopId).subscribe({
      next: (items) => {
        this.menuItems.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openAdd(): void {
    this.editingItem.set(null);
    this.form.reset({ isVeg: true, stockQuantity: 50, prepTimeMins: 10 });
    this.showForm.set(true);
  }

  openEdit(item: FoodItem): void {
    this.editingItem.set(item);
    this.form.patchValue(item);
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingItem.set(null);
  }

  saveItem(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const formData = this.form.getRawValue();
    const editing = this.editingItem();

    const data = {
      ...formData,
      shop: { id: this.shopId },
    };

    const obs = editing
      ? this.vendor.updateMenuItem(editing.id, data) // PUT /api/food-items/{id}
      : this.vendor.addMenuItem(data);              // POST /api/food-items

    obs.subscribe({
      next: () => {
        this.notify.success(editing ? 'Item updated!' : 'Item added to menu!');
        this.saving.set(false);
        this.showForm.set(false);
        this.loadMenu();
      },
      error: (err) => {
        this.saving.set(false);
        this.notify.error(err.error?.message ?? 'Failed to save item.');
      },
    });
  }

  deleteItem(item: FoodItem): void {
    if (!confirm(`Delete "${item.name}"?`)) return;
    // DELETE /api/food-items/{id}
    this.vendor.deleteMenuItem(item.id).subscribe({
      next: () => {
        this.notify.success('Item removed from menu.');
        this.loadMenu();
      },
      error: () => this.notify.error('Failed to delete item.'),
    });
  }

  uploadImage(item: FoodItem, file: File): void {
    if (!file) return;
    // POST /api/food-items/{id}/image
    this.vendor.uploadFoodItemImage(item.id, file).subscribe({
      next: () => this.notify.success('Image uploaded!'),
      error: () => this.notify.error('Failed to upload image.'),
    });
  }

  toggleAvailability(item: FoodItem): void {
    // PUT /api/food-items/{id} - toggle stock to 0 to disable
    const updated = { ...item, stockQuantity: item.stockQuantity > 0 ? 0 : 10, shop: { id: this.shopId } };
    this.vendor.updateMenuItem(item.id, updated).subscribe({
      next: () => this.loadMenu(),
      error: () => this.notify.error('Failed to update item.'),
    });
  }
}
