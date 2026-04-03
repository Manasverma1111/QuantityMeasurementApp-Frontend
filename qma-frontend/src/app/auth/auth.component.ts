import {
  Component, OnInit, signal, computed, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators, AbstractControl,
  ValidationErrors, ReactiveFormsModule
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const v = control.value || '';
  if (!v) return null;
  if (v.length < 8 || !/[A-Z]/.test(v) || !/[a-z]/.test(v) || !/\d/.test(v)) {
    return { weakPassword: true };
  }
  return null;
}

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw      = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pw && confirm && pw !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  private fb          = inject(FormBuilder);
  private authService = inject(AuthService);
  private router      = inject(Router);

  mode                 = signal<'login' | 'signup'>('login');
  isLoading            = signal(false);
  errorMsg             = signal('');
  showPassword         = signal(false);
  showConfirmPassword  = signal(false);
  isLoginMode          = computed(() => this.mode() === 'login');
  passwordStrength     = signal(0);
  strengthLabel        = computed(() => (['', 'Weak', 'Fair', 'Good', 'Strong'])[this.passwordStrength()]);
  strengthClass        = computed(() => (['', 'strength-weak', 'strength-fair', 'strength-good', 'strength-strong'])[this.passwordStrength()]);

  loginForm!:  FormGroup;
  signupForm!: FormGroup;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email:      ['', [Validators.required, Validators.email]],
      password:   ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });

    this.signupForm = this.fb.group({
      name:            ['', [Validators.required, Validators.minLength(2)]],
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, passwordStrengthValidator]],
      confirmPassword: ['', Validators.required],
      agreeTerms:      [false, Validators.requiredTrue],
    }, { validators: passwordMatchValidator });

    this.signupForm.get('password')?.valueChanges.subscribe(v => {
      this.passwordStrength.set(this.calcStrength(v));
    });
  }

  // ── Google: triggers full-page redirect to Spring Boot ───────────────────
  // Spring Boot handles: /oauth2/authorization/google → Google → successHandler → JWT
  loginWithGoogle(): void {
    this.authService.loginWithGoogle();
  }

  switchMode(m: 'login' | 'signup'): void {
    this.mode.set(m);
    this.errorMsg.set('');
    this.loginForm.reset();
    this.signupForm.reset();
  }

  onLogin(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.isLoading.set(true);
    this.errorMsg.set('');
    this.authService.login(this.loginForm.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg.set(err?.userMessage || 'Invalid email or password.');
      },
      complete: () => this.isLoading.set(false),
    });
  }

  onSignup(): void {
    if (this.signupForm.invalid) { this.signupForm.markAllAsTouched(); return; }
    this.isLoading.set(true);
    this.errorMsg.set('');
    const { name, email, password } = this.signupForm.value;
    this.authService.signup({ name, email, password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg.set(err?.userMessage || 'Registration failed. Please try again.');
      },
      complete: () => this.isLoading.set(false),
    });
  }

  togglePassword(field: 'password' | 'confirm'): void {
    if (field === 'password') this.showPassword.update(v => !v);
    else this.showConfirmPassword.update(v => !v);
  }

  hasError(form: FormGroup, field: string, error?: string): boolean {
    const ctrl = form.get(field);
    if (!ctrl || !(ctrl.dirty || ctrl.touched)) return false;
    return error ? ctrl.hasError(error) : ctrl.invalid;
  }

  hasFormError(form: FormGroup, error: string): boolean {
    return !!(form.errors?.[error] &&
      (form.get('confirmPassword')?.dirty || form.get('confirmPassword')?.touched));
  }

  private calcStrength(pw: string): number {
    if (!pw || pw.length < 4) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[!@#$%^&*]/.test(pw)) s++;
    return s;
  }
}