import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Subscription } from "rxjs";

import { AuthService } from "../auth.service";

@Component({
templateUrl: './signup.component.html',
styleUrls: ['./signup.component.css']
})

export class SignupComponent implements OnInit, OnDestroy {

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

  onSignup(form: NgForm) {
    if(form.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.createUser(form.value.email, form.value.password);
  }

}
