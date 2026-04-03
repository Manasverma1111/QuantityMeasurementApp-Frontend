import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-shell">
      <div class="callback-card">
        @if (error) {
          <div class="cb-error">
            <span class="cb-icon">✗</span>
            <p>{{ error }}</p>
            <a href="/auth/login" class="cb-link">Back to Login</a>
          </div>
        } @else {
          <span class="cb-spinner"></span>
          <p>Completing sign-in…</p>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .callback-shell {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: #0f0f13;
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: #f1f0f5;
      }
      .callback-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
      .cb-spinner {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid rgba(99, 102, 241, 0.3);
        border-top-color: #6366f1;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      p {
        color: #8b8a9b;
        margin: 0;
        font-size: 0.9rem;
      }
      .cb-error {
        text-align: center;
      }
      .cb-icon {
        font-size: 2rem;
        color: #f87171;
      }
      .cb-link {
        display: inline-block;
        margin-top: 0.5rem;
        color: #6366f1;
        font-size: 0.875rem;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
      }
    `,
  ],
})
export class OAuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  error = '';

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;

    const token = params['token'];
    const email = params['email'];
    const name = params['name'];

    if (!token || !email) {
      this.error = 'Google sign-in failed — invalid response.';
      return;
    }

    this.authService.handleGoogleCallback(token, email, name || '');
  }
}
