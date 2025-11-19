import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-root-redirect',
  standalone: true,
  template: ''
})
export class RootRedirect implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirect to appropriate page based on user role
    const redirectTo = this.authService.getDefaultRoute();
    this.router.navigate([redirectTo], { replaceUrl: true });
  }
}
