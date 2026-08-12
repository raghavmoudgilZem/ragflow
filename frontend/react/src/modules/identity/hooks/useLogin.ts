import { useState } from 'react';
import type { ChangeEvent, SyntheticEvent } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { ROUTES } from '@modules/identity/constants/routes';

export interface LoginFormData {
  email: string;
  password: string;
  nickname: string;
  rememberMe: boolean;
}

export interface FormErrors {
  email?: string;
  password?: string;
  nickname?: string;
}

export const useLogin = () => {
  const { isLoading, error: apiError, loginUser, registerUser, clearAuthError } = useAuthStore();

  const [isSignUp, setIsSignUp] = useState<boolean>(false);

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    nickname: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const toggleViewMode = (e: SyntheticEvent) => {
    e.preventDefault();
    setIsSignUp(prev => !prev);
    setErrors({});
    clearAuthError();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (apiError) {
      clearAuthError();
    }
  };

  const validateForm = (): boolean => {
    const localErrors: FormErrors = {};

    if (!formData.email.trim()) {
      localErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      localErrors.email = 'Please enter a valid email address';
    }

    if (isSignUp && !formData.nickname.trim()) {
      localErrors.nickname = 'Nickname is required';
    }

    if (!formData.password) {
      localErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      localErrors.password = 'Password must be at least 8 characters long';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      localErrors.password = 'Password must contain at least one letter and one number';
    }

    setErrors(localErrors);
    return Object.keys(localErrors).length === 0;
  };

  const submitForm = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isSignUp) {
      const registered = await registerUser({
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname
      });
      if (registered) {
        setIsSignUp(false);
        setErrors({});
        alert('Account created successfully! Please sign in with your new credentials.');
      }
    } else {
      const signedIn = await loginUser({
        email: formData.email,
        password: formData.password
      });

      if (signedIn) {
        const searchParams = new URLSearchParams(window.location.search);
        const returnUrl = searchParams.get('returnUrl') || ROUTES.HOME;
        window.location.href = returnUrl;
      }
    }
  };

  return {
    formData,
    errors,
    isLoading,
    apiError,
    isSignUp,
    handleInputChange,
    submitForm,
    toggleViewMode,
  };
};