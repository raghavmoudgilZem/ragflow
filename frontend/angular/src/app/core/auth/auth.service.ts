import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { JwtPayload, UserInfo } from './auth.model';
import { AUTH_CONSTANTS } from './auth.constants';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';
import { API_ENDPOINTS } from '../../shared/constants/constant';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isUserAuthenticated: boolean = false;
  loginUserInfo = signal<UserInfo | null>(null);
  private readonly LOGIN_URL = API_ENDPOINTS.AUTH.LOGIN;

  constructor(
    private readonly router: Router,
    private readonly http: HttpClient,
  ) {}

  initializeSession() {
    const userToken = this.getUserToken();
    if (!userToken) {
      this.clearSession();
      return;
    }
    const decodedToken = this.decodeToken(userToken);
    if(decodedToken && !this.isTokenExpired(decodedToken)){
      const user: UserInfo = {
        id: decodedToken.userId,
        email: decodedToken.email ?? '',
        nickname: decodedToken.nickname ?? 'User',
        avatar: decodedToken.avatar ?? '',
      };
      this.setLoggedInUserInfo(user);
      this.router.navigateByUrl("/admin/service-status");

    }else{
      this.clearSession();
    }
  }

  setLoggedInUserInfo(user: UserInfo) {
    this.loginUserInfo.set(user);
    this.isUserAuthenticated = true;
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode RAGFlow session token', error);
      return null;
    }
  }

  isTokenExpired(decoded: JwtPayload) {
    if (decoded.exp) {
      return Date.now() > decoded.exp * 1000;
    }
    if (!decoded.iat) {
      return true;
    }
    const issuedAt = decoded.iat * 1000;
    const timeline = AUTH_CONSTANTS.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000;
    const expiryTime = issuedAt + timeline;
    return Date.now() > expiryTime;
  }

  getUserToken(): string | null {
    return localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
  }

  setUserToken(token: string) {
    localStorage.setItem(AUTH_CONSTANTS.TOKEN_KEY, token);
  }

  removeUserToken() {
    localStorage.removeItem(AUTH_CONSTANTS.TOKEN_KEY);
  }

  clearSession() {
    this.isUserAuthenticated = false;
    this.removeUserToken();
    this.loginUserInfo.set(null);
    this.router.navigateByUrl('/login');
  }

  login(credentials: any): Observable<any> {
    return this.http.post(this.LOGIN_URL, credentials);
  }

  encryptPassword(password: string): string {
    const encrypted = CryptoJS.AES.encrypt(password, environment.JWT_SECRET).toString();
    return encrypted;
  }
}
