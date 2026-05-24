import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit(): void {
    if (this.loading) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService
      .login({ email: this.email.trim(), password: this.password })
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/ventas']);
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Email o contraseña incorrectos.';
        },
      });
  }
}
