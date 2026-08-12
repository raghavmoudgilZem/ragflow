import { describe, it, expect, beforeEach, vi } from "vitest";
import { LoginComponent } from "./login.component";
import { of, throwError } from "rxjs";
import {FormBuilder} from "@angular/forms"

describe("LoginComponent (Vitest)", () => {
  let component: LoginComponent;
  
  // Mock Dependencies
  let fbMock: any;
  let authServiceMock: any;
  let routerMock: any;
  let notificationMock: any;

  beforeEach(() => {
    // 1. Setup FormBuilder Mock
    // We use a real FormBuilder to make testing form logic easier
    fbMock = new FormBuilder();

    // 2. Setup Service Mocks
    authServiceMock = {
      encryptPassword: vi.fn((pw) => `encrypted_${pw}`),
      login: vi.fn(),
      setUserToken: vi.fn(),
      initializeSession: vi.fn(),
    };

    routerMock = {
      navigateByUrl: vi.fn(),
    };

    notificationMock = {
      showError: vi.fn(),
    };

    // 3. Initialize Component
    component = new LoginComponent(
      fbMock,
      authServiceMock,
      routerMock,
      notificationMock
    );
    
    // Trigger ngOnInit manually
    component.ngOnInit();
  });

  it("should initialize the form with empty fields", () => {
    expect(component.loginForm).toBeDefined();
    expect(component.controls['email'].value).toBe("");
    expect(component.controls['password'].value).toBe("");
  });

  it("should mark form as invalid when empty", () => {
    expect(component.loginForm.valid).toBe(false);
  });

  it("should validate email format", () => {
    const emailControl = component.controls['email'];
    emailControl.setValue("invalid-email");
    expect(emailControl.hasError("email")).toBe(true);

    emailControl.setValue("test@example.com");
    expect(emailControl.hasError("email")).toBe(false);
  });

  describe("onSubmit()", () => {
    it("should not call login if form is invalid", () => {
      component.loginForm.setValue({ email: "", password: "" });
      component.onSubmit();
      expect(authServiceMock.login).not.toHaveBeenCalled();
    });

    it("should encrypt password and call login when form is valid", () => {
      const loginData = { email: "test@example.com", password: "password123" };
      component.loginForm.setValue(loginData);

      // Mock successful login response
      const mockResponse = { data: { access_token: "mock-jwt-token" } };
      authServiceMock.login.mockReturnValue(of(mockResponse));

      component.onSubmit();

      // Check encryption call
      expect(authServiceMock.encryptPassword).toHaveBeenCalledWith("password123");
      
      // Check login payload
      expect(authServiceMock.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "encrypted_password123",
      });

      // Check session handling
      expect(authServiceMock.setUserToken).toHaveBeenCalledWith("mock-jwt-token");
      expect(authServiceMock.initializeSession).toHaveBeenCalled();
    });

    it("should show notification error on login failure", () => {
      component.loginForm.setValue({ email: "test@example.com", password: "wrong" });

      const errorResponse = {
        error: { message: "Invalid Credentials" }
      };
      authServiceMock.login.mockReturnValue(throwError(() => errorResponse));

      component.onSubmit();

      expect(notificationMock.showError).toHaveBeenCalledWith("Invalid Credentials");
    });
  });

  describe("isAutofilled", () => {
    it("should return false if elements are not autofilled", () => {
      // Mocking ViewChild nativeElements
      component.emailInput = { nativeElement: { matches: vi.fn().mockReturnValue(false) } } as any;
      component.passwordInput = { nativeElement: { matches: vi.fn().mockReturnValue(false) } } as any;

      expect(component.isAutofilled).toBe(false);
    });

    it("should return true if both elements are autofilled", () => {
      component.emailInput = { nativeElement: { matches: vi.fn().mockReturnValue(true) } } as any;
      component.passwordInput = { nativeElement: { matches: vi.fn().mockReturnValue(true) } } as any;

      expect(component.isAutofilled).toBe(true);
    });
  });
});