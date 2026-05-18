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
import { AuthService } from '../../../core/services/auth.service';
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

  categories = ['Starters', 'Main Course', 'Snacks', 'Beverages', 'Desserts', 'Combos'];

  form: FormGroup;

  constructor(
    private vendor: VendorService,
    private notify: NotificationService,
    private auth: AuthService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(1)]],
      category: ['', Validators.required],
      prepTime: [10, Validators.required],
      isVeg: [true],
      isAvailable: [true],
      stock: [50, Validators.min(0)],
      imageUrl: [''],
    });
  }

  ngOnInit(): void {
    this.loadMenu();
  }

  loadMenu(): void {
    const shopId = this.auth.currentUser()?.id ?? 0;
    // GET /fooditem/getByShop/{shopId}
    this.vendor.getMenuByShop(shopId).subscribe({
      next: (items) => {
        this.menuItems.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openAdd(): void {
    this.editingItem.set(null);
    this.form.reset({ isVeg: true, isAvailable: true, stock: 50, prepTime: 10 });
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
    const data = this.form.getRawValue();
    const editing = this.editingItem();

    const obs = editing
      ? this.vendor.updateMenuItem(editing.id, data) // PUT /fooditem/update/{id}
      : this.vendor.addMenuItem(data);              // POST /fooditem/create

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
    // DELETE /fooditem/delete/{id}
    this.vendor.deleteMenuItem(item.id).subscribe({
      next: () => {
        this.notify.success('Item removed from menu.');
        this.loadMenu();
      },
      error: () => this.notify.error('Failed to delete item.'),
    });
  }

  toggleAvailability(item: FoodItem): void {
    // PUT /fooditem/update/{id}
    this.vendor.updateMenuItem(item.id, { ...item, isAvailable: !item.isAvailable }).subscribe({
      next: () => this.loadMenu(),
      error: () => this.notify.error('Failed to update availability.'),
    });
  }
}
