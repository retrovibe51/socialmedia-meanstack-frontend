import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  isUserAuthenticated = false;
  private authListenerSubscription: Subscription

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.isUserAuthenticated = this.authService.getAuthStatus();
    this.authListenerSubscription = this.authService.getAuthStatusListener().subscribe((isAuthenticated) => {
      this.isUserAuthenticated = isAuthenticated;
     });
  }

  ngOnDestroy() {
    this.authListenerSubscription.unsubscribe();
  }

  onLogout() {
    this.authService.logout();
  }
}
