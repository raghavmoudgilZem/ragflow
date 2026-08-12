import { create } from 'zustand';
import axios from 'axios';
import type { AuthState, UserProfile, LoginFormData } from '../types/identity.types';
import { AUTH_ERROR_MESSAGES } from '../constants/errorMessages';
import type { TenantMember, JoinedTeam } from '../types/tenant.types';

interface RegisterFormData extends Omit<LoginFormData, 'rememberMe'> {
    nickname: string;
}

export interface ExtendedUserProfile extends UserProfile {
    timeZone?: string;
    roles?: string[];
    tenantContext?: {
        members: TenantMember[];
        joinedTeams: JoinedTeam[];
    };
}

export interface UpdateProfilePayload {
    nickname?: string;
    name?: string;
    avatarUrl?: string;
    timeZone?: string;
    roles?: string[];
}

interface AuthStore extends Omit<AuthState, 'user'> {
    user: ExtendedUserProfile | null;
    loginUser: (credentials: Omit<LoginFormData, 'rememberMe'>) => Promise<boolean>;
    registerUser: (accountData: RegisterFormData) => Promise<boolean>;
    clearAuthError: () => void;
    logoutAction: () => void;
    refreshTenantContext: (updatedPayload: { members?: TenantMember[]; joinedTeams?: JoinedTeam[] }) => void;
    updateProfileState: (updatedFields: UpdateProfilePayload) => void;
}

const getInitialUser = (): ExtendedUserProfile | null => {
    try {
        const profile = sessionStorage.getItem('userProfile');
        if (!profile) return null;

        const parsedProfile: ExtendedUserProfile = JSON.parse(profile);
        if (parsedProfile.email) {
            const savedAvatar = localStorage.getItem(`user_avatar_${parsedProfile.email}`);
            if (savedAvatar !== null) {
                parsedProfile.avatarUrl = savedAvatar;
            }
        }
        return parsedProfile;
    } catch (e) {
        console.error("Failed to parse initial user profile state:", e);
        return null;
    }
};

const AUTH_API_BASE = import.meta.env.DEV ? 'http://localhost:4000' : '';

export const useAuthStore = create<AuthStore>((set) => ({
    isLoading: false,
    user: getInitialUser(),
    error: null,

    clearAuthError: () => set({ error: null }),

    logoutAction: () => {
        try {
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('userProfile');
        } catch (e) {
            console.error("Error clearing sessionStorage on logout:", e);
        }
        set({ user: null, error: null, isLoading: false });
    },

    refreshTenantContext: (updatedPayload) => {
        try {
            const rawProfile = sessionStorage.getItem('userProfile');
            if (rawProfile) {
                const parsedProfile = JSON.parse(rawProfile);
                const patchedProfile = {
                    ...parsedProfile,
                    tenantContext: {
                        members: updatedPayload.members ?? parsedProfile.tenantContext?.members ?? [],
                        joinedTeams: updatedPayload.joinedTeams ?? parsedProfile.tenantContext?.joinedTeams ?? []
                    }
                };
                sessionStorage.setItem('userProfile', JSON.stringify(patchedProfile));
            }

            set((state) => {
                if (!state.user) return {};
                return {
                    user: {
                        ...state.user,
                        tenantContext: {
                            members: updatedPayload.members ?? state.user.tenantContext?.members ?? [],
                            joinedTeams: updatedPayload.joinedTeams ?? state.user.tenantContext?.joinedTeams ?? []
                        }
                    }
                };
            });
        } catch (error) {
            console.error("Silent intercept patch sync failure inside sessionStorage:", error);
        }
    },

    updateProfileState: (updatedFields: UpdateProfilePayload) => {
        try {
            const rawProfile = sessionStorage.getItem('userProfile');
            const parsedProfile = rawProfile ? JSON.parse(rawProfile) : {};

            const updatedProfile: ExtendedUserProfile = {
                ...parsedProfile,
                ...updatedFields,
                nickname: updatedFields.nickname ?? parsedProfile.nickname,
                name: updatedFields.nickname ?? updatedFields.name ?? parsedProfile.name ?? parsedProfile.nickname,
                avatarUrl: updatedFields.avatarUrl !== undefined ? updatedFields.avatarUrl : parsedProfile.avatarUrl,
                timeZone: updatedFields.timeZone ?? parsedProfile.timeZone
            };

            // Save or delete avatar in persistent localStorage per user email
            const userEmail = updatedProfile.email || parsedProfile.email;
            if (updatedFields.avatarUrl !== undefined && userEmail) {
                const avatarStorageKey = `user_avatar_${userEmail}`;
                if (updatedFields.avatarUrl) {
                    localStorage.setItem(avatarStorageKey, updatedFields.avatarUrl);
                } else {
                    localStorage.removeItem(avatarStorageKey);
                }
            }

            sessionStorage.setItem('userProfile', JSON.stringify(updatedProfile));

            set((state) => {
                if (!state.user) return {};
                return {
                    user: {
                        ...state.user,
                        ...updatedProfile
                    }
                };
            });
        } catch (error) {
            console.error("Failed to sync profile update into store and sessionStorage:", error);
        }
    },

    loginUser: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
            if (!navigator.onLine) {
                set({ isLoading: false, error: AUTH_ERROR_MESSAGES.OFFLINE });
                return false;
            }

            const response = await axios.post(`${AUTH_API_BASE}/api/v1/auth/login`, credentials, {
                headers: { 'Content-Type': 'application/json' }
            });

            const data = response.data;
            sessionStorage.setItem('accessToken', data.accessToken);
            sessionStorage.setItem('refreshToken', data.refreshToken);

            const userPayload = data.userProfile || data.user;
            const userEmail = userPayload.email || credentials.email;

            // Check if user has a persisted avatar in localStorage
            const savedAvatarKey = `user_avatar_${userEmail}`;
            const persistedAvatar = localStorage.getItem(savedAvatarKey);

            const profilePayload: ExtendedUserProfile = {
                id: userPayload.id,
                email: userEmail,
                nickname: userPayload.nickname,
                name: userPayload.nickname || userPayload.name,
                avatarUrl: persistedAvatar ?? userPayload.avatarUrl ?? userPayload.avatar_url ?? '',
                currentTenantId: userPayload.currentTenantId || userPayload.current_tenant_id,
                timeZone: userPayload.timeZone || userPayload.timezone || 'UTC+8 Asia/Shanghai',
                roles: userPayload.roles || ['OWNER'],
                tenantContext: userPayload.tenantContext || { members: [], joinedTeams: [] }
            };

            sessionStorage.setItem('userProfile', JSON.stringify(profilePayload));
            set({ isLoading: false, user: profilePayload, error: null });
            return true;

        } catch (error: unknown) {
            let mappedError: string = AUTH_ERROR_MESSAGES.FALLBACK_FAILED;

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    mappedError = error.response.data?.error || error.response.data?.message || mappedError;
                } else if (error.request) {
                    mappedError = AUTH_ERROR_MESSAGES.MOCK_CONNECT_FAILED;
                }
            }
            set({ isLoading: false, error: mappedError });
            return false;
        }
    },

    registerUser: async (accountData) => {
        set({ isLoading: true, error: null });
        try {
            if (!navigator.onLine) {
                set({ isLoading: false, error: AUTH_ERROR_MESSAGES.OFFLINE });
                return false;
            }

            await axios.post(`${AUTH_API_BASE}/api/v1/auth/signup`, accountData, {
                headers: { 'Content-Type': 'application/json' }
            });

            set({ isLoading: false, error: null });
            return true;

        } catch (error: unknown) {
            let mappedError: string = AUTH_ERROR_MESSAGES.FALLBACK_FAILED;

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    mappedError = error.response.data?.error || error.response.data?.message || mappedError;
                } else if (error.request) {
                    mappedError = AUTH_ERROR_MESSAGES.MOCK_CONNECT_FAILED;
                }
            }
            set({ isLoading: false, error: mappedError });
            return false;
        }
    }
}));