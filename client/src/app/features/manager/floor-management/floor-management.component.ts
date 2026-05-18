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
import { forkJoin } from 'rxjs';

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
  ],
  templateUrl: './floor-management.component.html',
  styleUrl: './floor-management.component.scss',
})
export class FloorManagementComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);

  floors = signal<Floor[]>([]);
  shops = signal<Restaurant[]>([]);

  showFloorForm = signal(false);
  editingFloor = signal<Floor | null>(null);

  showShopForm = signal(false);
  editingShop = signal<Restaurant | null>(null);

  floorForm: FormGroup;
  shopForm: FormGroup;

  constructor(
    private manager: ManagerService,
    private notify: NotificationService,
    private fb: FormBuilder
  ) {
    this.floorForm = this.fb.group({
      name: ['', Validators.required],
      floorNumber: [1, Validators.required],
      description: [''],
    });

    this.shopForm = this.fb.group({
      name: ['', Validators.required],
      cuisine: ['', Validators.required],
      description: [''],
      floorId: [null, Validators.required],
      avgPrepTime: [15],
      isOpen: [true],
    });
  }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    forkJoin({
      floors: this.manager.getAllFloors(),  // GET /floor/getAll
      shops: this.manager.getAllShops(),    // GET /shop/getAll
    }).subscribe({
      next: ({ floors, shops }) => {
        this.floors.set(floors);
        this.shops.set(shops);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // ── FLOORS ──
  openAddFloor(): void {
    this.editingFloor.set(null);
    this.floorForm.reset({ floorNumber: 1 });
    this.showFloorForm.set(true);
  }

  openEditFloor(floor: Floor): void {
    this.editingFloor.set(floor);
    this.floorForm.patchValue(floor);
    this.showFloorForm.set(true);
  }

  saveFloor(): void {
    if (this.floorForm.invalid) return;
    this.saving.set(true);
    const data = this.floorForm.getRawValue();
    const editing = this.editingFloor();

    const obs = editing
      ? this.manager.updateFloor(editing.id, data)   // PUT /floor/update/{id}
      : this.manager.createFloor(data);              // POST /floor/create

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
    if (!confirm(`Delete floor "${floor.name}"? All shops on this floor will be unassigned.`)) return;
    // DELETE /floor/delete/{id}
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
    this.shopForm.reset({ avgPrepTime: 15, isOpen: true });
    this.showShopForm.set(true);
  }

  openEditShop(shop: Restaurant): void {
    this.editingShop.set(shop);
    this.shopForm.patchValue({
      ...shop,
      floorId: shop.floor?.id,
    });
    this.showShopForm.set(true);
  }

  saveShop(): void {
    if (this.shopForm.invalid) return;
    this.saving.set(true);
    const data = this.shopForm.getRawValue();
    const editing = this.editingShop();

    const obs = editing
      ? this.manager.updateShop(editing.id, data)   // PUT /shop/update/{id}
      : this.manager.createShop(data);              // POST /shop/create

    obs.subscribe({
      next: () => {
        this.notify.success(editing ? 'Shop updated!' : 'Shop created!');
        this.saving.set(false);
        this.showShopForm.set(false);
        this.loadAll();
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

  reassignShopFloor(shop: Restaurant, floorId: number): void {
    // PUT /shop/update/{id}
    this.manager.updateShop(shop.id, { ...shop, floorId } as any).subscribe({
      next: () => {
        this.notify.success(`${shop.name} moved to new floor!`);
        this.loadAll();
      },
      error: () => this.notify.error('Failed to reassign floor.'),
    });
  }
}
