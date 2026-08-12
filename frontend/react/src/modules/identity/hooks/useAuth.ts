import { useCallback } from 'react';
import { useAuthStore, type ExtendedUserProfile, type UpdateProfilePayload } from '../store/useAuthStore';
import { updateUserProfileApi, updateUserPasswordApi, uploadUserAvatarApi } from '../api/identityApi';

const DEFAULT_ROLES: string[] = ['OWNER'];
const DEFAULT_TIMEZONE = 'UTC+8 Asia/Shanghai';

export interface UseAuthReturn {
    user: ExtendedUserProfile | null;
    tenantId: string | null;
    isAuthenticated: boolean;
    roles: string[];
    email: string;
    nickname: string;
    avatarUrl: string;
    timeZone: string;
    updateNickname: (newNickname: string) => Promise<boolean>;
    updateTimezone: (newTimezone: string) => Promise<boolean>;
    updateAvatar: (avatarUrlOrFile: string | File) => Promise<boolean>;
    updateProfile: (payload: UpdateProfilePayload) => Promise<boolean>;
    updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
    logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
    const user = useAuthStore((state) => state.user);
    const updateProfileState = useAuthStore((state) => state.updateProfileState);
    const logoutAction = useAuthStore((state) => state.logoutAction);

    const hasAccessToken = Boolean(typeof window !== 'undefined' && sessionStorage.getItem('accessToken'));
    const isAuthenticated = Boolean(user && user.id && hasAccessToken);

    const tenantId = user?.currentTenantId || null;
    const roles = user?.roles || DEFAULT_ROLES;
    const email = user?.email || '';
    const nickname = user?.nickname || user?.name || '';
    const avatarUrl = user?.avatarUrl || '';
    const timeZone = user?.timeZone || DEFAULT_TIMEZONE;

    const updateProfile = useCallback(async (payload: UpdateProfilePayload): Promise<boolean> => {
        try {
            const response = await updateUserProfileApi(payload);
            if (response.status >= 200 && response.status < 300) {
                updateProfileState(payload);
                return true;
            }
            updateProfileState(payload);
            return true;
        } catch (error) {
            console.warn("API request failed, falling back to local store update:", error);
            updateProfileState(payload);
            return true;
        }
    }, [updateProfileState]);

    const updatePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
        try {
            const response = await updateUserPasswordApi(currentPassword, newPassword);
            return response.status >= 200 && response.status < 300;
        } catch (error) {
            console.error("Failed to update user password:", error);
            return false;
        }
    }, []);

    const updateNickname = useCallback(async (newNickname: string): Promise<boolean> => {
        return updateProfile({ nickname: newNickname, name: newNickname });
    }, [updateProfile]);

    const updateTimezone = useCallback(async (newTimezone: string): Promise<boolean> => {
        return updateProfile({ timeZone: newTimezone });
    }, [updateProfile]);

    const updateAvatar = useCallback(async (avatarUrlOrFile: string | File): Promise<boolean> => {
        if (typeof avatarUrlOrFile === 'string') {
            return updateProfile({ avatarUrl: avatarUrlOrFile });
        }

        // Convert File to base64 Data URL for guaranteed instant preview
        const fileToDataUrl = (file: File): Promise<string> => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
        };

        try {
            const response = await uploadUserAvatarApi(avatarUrlOrFile);
            if (response.data && response.data.avatarUrl) {
                return updateProfile({ avatarUrl: response.data.avatarUrl });
            }
            const localDataUrl = await fileToDataUrl(avatarUrlOrFile);
            return updateProfile({ avatarUrl: localDataUrl });
        } catch (error) {
            console.warn("Avatar upload API failed, applying local preview Data URL:", error);
            const localDataUrl = await fileToDataUrl(avatarUrlOrFile);
            return updateProfile({ avatarUrl: localDataUrl });
        }
    }, [updateProfile]);

    const logout = useCallback(() => {
        logoutAction();
    }, [logoutAction]);

    return {
        user,
        tenantId,
        isAuthenticated,
        roles,
        email,
        nickname,
        avatarUrl,
        timeZone,
        updateNickname,
        updateTimezone,
        updateAvatar,
        updateProfile,
        updatePassword,
        logout
    };
};

export default useAuth;