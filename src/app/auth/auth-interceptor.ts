import { HttpInterceptor, HttpRequest, HttpHandler } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { AuthService } from "./auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {   // the HttpInterceptor interface (implemented above) forces us to add the intercept() method to this class
    const authToken = this.authService.getToken();
    const authRequest = req.clone({   // always a good idea to clone request before manipulation.
      headers: req.headers.set('Authorization', "Bearer " + authToken) // Authorization is the header we are extracting in backend (it is case-insensitive hence CAPS A here)
    });

    return next.handle(authRequest);
  }
}
