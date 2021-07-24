import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Subscription } from "rxjs";

import { AuthService } from "../auth.service";

@Component({
templateUrl: './login.component.html',
styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy{
  isLoading = false;
  private authListenerSubscription: Subscription

  constructor(public authService: AuthService) {}

  ngOnInit() {
    this.authListenerSubscription = this.authService.getAuthStatusListener().subscribe((isAuthenticated) => {
      if(!isAuthenticated) {
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    this.authListenerSubscription.unsubscribe();
  }

  onLogin(form: NgForm) {
    if(form.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.loginUser(form.value.email, form.value.password);
  }

}
