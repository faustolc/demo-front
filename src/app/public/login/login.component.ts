import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { username, password } = this.loginForm.value;

      this.authService.login(username, password).subscribe({
        next: (success) => {
          this.isLoading = false;
          if (success) {
            // Check if there's a redirect URL stored
            const redirectUrl = localStorage.getItem('redirectUrl') || '/auth';
            localStorage.removeItem('redirectUrl');
            this.router.navigate([redirectUrl]);
          } else {
            this.errorMessage = 'Invalid credentials. Please try again.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Login failed. Please try again.';
          console.error('Login error:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (control?.hasError('minlength')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least 3 characters`;
    }
    return '';
  }

  sendMail() {
    const username = this.loginForm.get('username')?.value;
    if (!username) {
      this.errorMessage = 'Please enter your email to reset your password.';
      return;
    }
    this.authService.sendPasswordResetEmail(username).subscribe({
      next: () => {
        this.errorMessage = 'We sent you an email with your password.';
      },
      error: (error) => {
        this.errorMessage = 'Failed to send email. Please try again later.';
        console.error('Send email error:', error);
      }
    });
  }
}
