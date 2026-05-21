import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

import { ManagerService } from '../../../core/services/manager.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Floor, Restaurant } from '../../../core/models/restaurant.model';
import { User } from '../../../core/models/user.model';
import { forkJoin } from 'rxjs';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-floor-management',
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
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatSlideToggle
  ],
  templateUrl: './floor-management.component.html',
  styleUrl: './floor-management.component.scss',
})
export class FloorManagementComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);

  floors = signal<Floor[]>([]);
  shops = signal<Restaurant[]>([]);
  users = signal<User[]>([]);

  vendorPanelShopId = signal<number | null>(null);
  selectedVendorId = signal<number | null>(null);

  showFloorForm = signal(false);
  editingFloor = signal<Floor | null>(null);

  showShopForm = signal(false);
  editingShop = signal<Restaurant | null>(null);
  pendingShopImage = signal<File | null>(null);
  pendingShopImagePreview = signal<string | null>(null);

  floorForm: FormGroup;
  shopForm: FormGroup;

  get vendors(): User[] {
    return this.users().filter(u => u.role === 'VENDOR');
  }

  constructor(
    private manager: ManagerService,
    private notify: NotificationService,
    private fb: FormBuilder
  ) {
    this.floorForm = this.fb.group({
      floorNumber: ['', [Validators.required]],
      isActive: [true],
    });

    this.shopForm = this.fb.group({
      name: ['', Validators.required],
      floorId: [null, Validators.required],
      isVeg: [false],
      isOpen: [true],
      avgRating: [0],
    });
  }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    forkJoin({
      floors: this.manager.getAllFloors(),
      shops: this.manager.getAllShops(),
      users: this.manager.getAllUsers(),
    }).subscribe({
      next: ({ floors, shops, users }) => {
        this.floors.set(floors);
        this.shops.set(shops);
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // ── FLOORS ──
  openAddFloor(): void {
    this.editingFloor.set(null);
    this.floorForm.reset({ floorNumber: '', isActive: true });
    this.showFloorForm.set(true);
  }

  openEditFloor(floor: Floor): void {
    this.editingFloor.set(floor);
    this.floorForm.patchValue(floor);
    this.showFloorForm.set(true);
  }

  cancelFloorForm(): void {
    this.showFloorForm.set(false);
    this.editingFloor.set(null);
  }

  saveFloor(): void {
    if (this.floorForm.invalid) return;
    this.saving.set(true);
    const data = this.floorForm.getRawValue();
    const editing = this.editingFloor();

    const obs = editing
      ? this.manager.updateFloor(editing.id, data)   // PUT /api/floors/{id}
      : this.manager.createFloor(data);              // POST /api/floors

    obs.subscribe({
      next: () => {
        this.notify.success(editing ? 'Floor updated!' : 'Floor created!');
        this.saving.set(false);
        this.showFloorForm.set(false);
        this.loadAll();
      },
      error: (err) => {
        this.saving.set(false);
        this.notify.error(err.error?.message ?? 'Failed to save floor.');
      },
    });
  }

  deleteFloor(floor: Floor): void {
    if (!confirm(`Delete Floor ${floor.floorNumber}? All shops on this floor will be unassigned.`)) return;
    // DELETE /api/floors/{id}
    this.manager.deleteFloor(floor.id).subscribe({
      next: () => {
        this.notify.success('Floor deleted.');
        this.loadAll();
      },
      error: () => this.notify.error('Failed to delete floor.'),
    });
  }

  shopsOnFloor(floorId: number): Restaurant[] {
    return this.shops().filter(s => s.floor?.id === floorId);
  }

  // ── SHOPS ──
  openAddShop(): void {
    this.editingShop.set(null);
    this.shopForm.reset({ isVeg: false, isOpen: true, avgRating: 0 });
    this.pendingShopImage.set(null);
    this.pendingShopImagePreview.set(null);
    this.showShopForm.set(true);
  }

  openEditShop(shop: Restaurant): void {
    this.editingShop.set(shop);
    this.shopForm.patchValue({
      name: shop.name,
      floorId: shop.floor?.id,
      isVeg: shop.isVeg,
      isOpen: shop.isOpen,
      avgRating: shop.avgRating,
    });
    this.pendingShopImage.set(null);
    this.pendingShopImagePreview.set(null);
    this.showShopForm.set(true);
  }

  saveShop(): void {
    if (this.shopForm.invalid) return;
    this.saving.set(true);
    const raw = this.shopForm.getRawValue();
    const { floorId, ...rest } = raw;
    const data = { ...rest, floor: { id: floorId } };
    const editing = this.editingShop();

    const obs = editing
      ? this.manager.updateShop(editing.id, data)   // PUT /api/shops/{id}
      : this.manager.createShop(data);              // POST /api/shops

    obs.subscribe({
      next: (savedShop: Restaurant) => {
        const pendingFile = this.pendingShopImage();
        if (pendingFile) {
          this.manager.uploadShopImage(savedShop.id, pendingFile).subscribe({
            next: () => {
              this.notify.success(editing ? 'Shop updated!' : 'Shop created!');
              this.saving.set(false);
              this.showShopForm.set(false);
              this.pendingShopImage.set(null);
              this.pendingShopImagePreview.set(null);
              this.loadAll();
            },
            error: () => {
              this.notify.success(editing ? 'Shop updated!' : 'Shop created!');
              this.notify.error('Failed to upload image.');
              this.saving.set(false);
              this.showShopForm.set(false);
              this.pendingShopImage.set(null);
              this.pendingShopImagePreview.set(null);
              this.loadAll();
            },
          });
        } else {
          this.notify.success(editing ? 'Shop updated!' : 'Shop created!');
          this.saving.set(false);
          this.showShopForm.set(false);
          this.loadAll();
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.notify.error(err.error?.message ?? 'Failed to save shop.');
      },
    });
  }

  deleteShop(shop: Restaurant): void {
    if (!confirm(`Delete shop "${shop.name}"?`)) return;
    // DELETE /shop/delete/{id}
    this.manager.deleteShop(shop.id).subscribe({
      next: () => {
        this.notify.success('Shop deleted.');
        this.loadAll();
      },
      error: () => this.notify.error('Failed to delete shop.'),
    });
  }

  cancelShopForm(): void {
    this.showShopForm.set(false);
    this.pendingShopImage.set(null);
    this.pendingShopImagePreview.set(null);
  }

  selectShopImage(file: File): void {
    if (!file) return;
    this.pendingShopImage.set(file);
    const reader = new FileReader();
    reader.onload = (e) => this.pendingShopImagePreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  shopImageSrc(shopId: number): string {
    return this.manager.getShopImageUrl(shopId);
  }

  uploadShopImage(shop: Restaurant, file: File): void {
    if (!file) return;
    // POST /api/shops/{id}/image
    this.manager.uploadShopImage(shop.id, file).subscribe({
      next: () => this.notify.success('Shop image uploaded!'),
      error: () => this.notify.error('Failed to upload shop image.'),
    });
  }

  reassignShopFloor(shop: Restaurant, floorId: number): void {
    // PUT /api/shops/{id}
    this.manager.updateShop(shop.id, { ...shop, floor: { id: floorId, floorNumber: '', isActive: true } }).subscribe({
      next: () => {
        this.notify.success(`${shop.name} moved to new floor!`);
        this.loadAll();
      },
      error: () => this.notify.error('Failed to reassign floor.'),
    });
  }

  // ── VENDOR ASSIGNMENT ──
  openVendorPanel(shop: Restaurant): void {
    this.vendorPanelShopId.set(shop.id);
    this.selectedVendorId.set(shop.vendor?.employeeId ?? null);
  }

  closeVendorPanel(): void {
    this.vendorPanelShopId.set(null);
    this.selectedVendorId.set(null);
  }

  confirmVendorAssign(shop: Restaurant): void {
    const vendorId = this.selectedVendorId();
    if (!vendorId) return;
    const obs = shop.vendor
      ? this.manager.reassignVendorToShop(shop.id, vendorId)  // PUT
      : this.manager.assignVendorToShop(shop.id, vendorId);   // POST
    obs.subscribe({
      next: () => {
        this.notify.success(shop.vendor ? 'Vendor reassigned!' : 'Vendor assigned!');
        this.closeVendorPanel();
        this.loadAll();
      },
      error: (err) => this.notify.error(err.error?.message ?? 'Failed to update vendor.'),
    });
  }

  confirmUnassign(shop: Restaurant): void {
    if (!confirm(`Remove vendor from "${shop.name}"?`)) return;
    this.manager.unassignVendorFromShop(shop.id).subscribe({  // DELETE
      next: () => {
        this.notify.success('Vendor removed.');
        this.closeVendorPanel();
        this.loadAll();
      },
      error: (err) => this.notify.error(err.error?.message ?? 'Failed to unassign vendor.'),
    });
  }
}
