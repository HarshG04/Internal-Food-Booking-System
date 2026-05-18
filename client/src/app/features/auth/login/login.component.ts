import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private notify = inject(NotificationService);

  loading = signal(false);
  hidePassword = signal(true);

  form = this.fb.nonNullable.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    role: ['USER' as 'USER' | 'VENDOR' | 'MANAGER', Validators.required],
  });

  constructor() {
    if (this.auth.isLoggedIn()) {
      this.redirectByRole(this.auth.getRole());
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);

    const { identifier, password, role } = this.form.getRawValue();
    this.auth.login({ identifier, password, role }).subscribe({
      next: (res) => {
        this.notify.success(`Welcome back, ${res.user.name}!`);
        this.redirectByRole(res.user.role);
      },
      error: (err) => {
        this.loading.set(false);
        const msg =
          err.error?.message ?? 'Login failed. Please check your credentials.';
        this.notify.error(msg);
      },
    });
  }

  private redirectByRole(role: string | null): void {
    if (role === 'VENDOR') this.router.navigate(['/vendor/dashboard']);
    else if (role === 'MANAGER') this.router.navigate(['/manager/dashboard']);
    else this.router.navigate(['/home']);
  }

  get roleLabel(): string {
    const r = this.form.get('role')?.value;
    if (r === 'VENDOR') return 'Vendor ID';
    if (r === 'MANAGER') return 'Manager ID';
    return 'Employee ID / Company Email';
  }
}
