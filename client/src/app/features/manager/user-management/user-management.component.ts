import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ManagerService } from '../../../core/services/manager.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-management',
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
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent implements OnInit {
  private manager = inject(ManagerService);
  private notify = inject(NotificationService);
  private fb = inject(FormBuilder);

  loading = signal(true);
  saving = signal(false);
  showForm = signal(false);

  users = signal<User[]>([]);

  displayedColumns = ['employeeId', 'fullName', 'email', 'phone', 'role', 'status', 'actions'];

  roles: Array<'ADMIN' | 'EMPLOYEE' | 'VENDOR'> = ['EMPLOYEE', 'VENDOR', 'ADMIN'];

  form = this.fb.nonNullable.group({
    employeeId: [null as unknown as number, [Validators.required, Validators.min(1)]],
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(4)]],
    role: ['EMPLOYEE' as 'ADMIN' | 'EMPLOYEE' | 'VENDOR', Validators.required],
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.manager.getAllUsers().subscribe({
      next: (users) => { this.users.set(users); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreateForm(): void {
    this.form.reset({ role: 'EMPLOYEE' });
    this.showForm.set(true);
  }

  createUser(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.manager.createUser(this.form.getRawValue()).subscribe({
      next: () => {
        this.notify.success('User created successfully!');
        this.saving.set(false);
        this.showForm.set(false);
        this.loadUsers();
      },
      error: (err) => {
        this.saving.set(false);
        this.notify.error(err.error?.message ?? 'Failed to create user. Email or Employee ID may already exist.');
      },
    });
  }

  toggleActive(user: User): void {
    this.manager.setUserActive(user.employeeId, !user.isActive).subscribe({
      next: (updated) => {
        this.users.update(list => list.map(u => u.employeeId === updated.employeeId ? updated : u));
        this.notify.success(`${updated.fullName} is now ${updated.isActive ? 'active' : 'inactive'}.`);
      },
      error: () => this.notify.error('Failed to update user status.'),
    });
  }
}
