import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthService } from "./auth.service";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http"; 

describe("AuthService (Vitest)", () => {
  let service: AuthService;
  let routerMock: Router;
  let httpMock: HttpClient;
  beforeEach(() => {
    routerMock = {
      navigateByUrl: vi.fn(),
    } as any;

    httpMock = {
      get: vi.fn(),
      post: vi.fn(),
    } as any;

    service = new AuthService(routerMock, httpMock); 
  });


  it("should clear session if no token exists", () => {
    vi.spyOn(service, "getUserToken").mockReturnValue(null);
    const clearSpy = vi.spyOn(service, "clearSession");

    service.initializeSession();

    expect(clearSpy).toHaveBeenCalled();
  });

  it("should login and navigate if token is valid", () => {
    const decodedPayload: any = {
      userId: "123",
      email: "test@example.com",
      nickname: "Kalpana",
      avatar: "img.png",
      iat: Date.now() / 1000,
      exp: Date.now() / 1000 + 3600,
    };

    vi.spyOn(service, "getUserToken").mockReturnValue("valid.jwt.token");
    vi.spyOn(service, "decodeToken").mockReturnValue(decodedPayload);
    vi.spyOn(service, "isTokenExpired").mockReturnValue(false);

    service.initializeSession();

    expect(service.isUserAuthenticated).toBe(true);
    expect(service.loginUserInfo()).toEqual({
      id: "123",
      email: "test@example.com",
      nickname: "Kalpana",
      avatar: "img.png",
    });

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith("/admin/service-status");
  });

  it("should clear session if token is expired", () => {
    vi.spyOn(service, "getUserToken").mockReturnValue("expired.jwt.token");
    vi.spyOn(service, "decodeToken").mockReturnValue({
      userId: "123",
      exp: 0,
    } as any);

    vi.spyOn(service, "isTokenExpired").mockReturnValue(true);

    const clearSpy = vi.spyOn(service, "clearSession");

    service.initializeSession();

    expect(clearSpy).toHaveBeenCalled();
  });

  it("should clear session if decodeToken fails", () => {
    vi.spyOn(service, "getUserToken").mockReturnValue("bad.token");
    vi.spyOn(service, "decodeToken").mockReturnValue(null);

    const clearSpy = vi.spyOn(service, "clearSession");

    service.initializeSession();

    expect(clearSpy).toHaveBeenCalled();
  });

  it("should set user info and mark authenticated", () => {
    service.setLoggedInUserInfo({
      id: "1",
      email: "a@b.com",
      nickname: "User",
      avatar: "",
    });

    expect(service.isUserAuthenticated).toBe(true);
    expect(service.loginUserInfo()?.id).toBe("1");
  });
});