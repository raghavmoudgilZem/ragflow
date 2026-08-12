import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAuth } from './useAuth';
import { useAuthStore } from '../store/useAuthStore';

vi.mock('../api/identityApi', () => ({
    updateUserProfileApi: vi.fn(),
    updateUserPasswordApi: vi.fn(),
    uploadUserAvatarApi: vi.fn(),
}));

import { updateUserProfileApi, updateUserPasswordApi, uploadUserAvatarApi } from '../api/identityApi';

const mockedUpdateUserProfileApi = vi.mocked(updateUserProfileApi);
const mockedUpdateUserPasswordApi = vi.mocked(updateUserPasswordApi);
const mockedUploadUserAvatarApi = vi.mocked(uploadUserAvatarApi);

describe('useAuth Hook', () => {
    const mockUser = {
        id: 'usr-veera-123',
        email: 'veerababu.musamalla@zemosolabs.com',
        nickname: 'Veera',
        name: 'Veera',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=veera',
        timeZone: 'UTC+8 Asia/Shanghai',
        currentTenantId: 'tn-01',
        roles: ['OWNER'],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
        useAuthStore.setState({
            user: mockUser,
            logoutAction: vi.fn(),
            updateProfileState: vi.fn(),
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return correct derived values when user and access token exist', () => {
        sessionStorage.setItem('accessToken', 'mock-access-token');

        const { result } = renderHook(() => useAuth());

        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.tenantId).toBe('tn-01');
        expect(result.current.roles).toEqual(['OWNER']);
        expect(result.current.email).toBe('veerababu.musamalla@zemosolabs.com');
        expect(result.current.nickname).toBe('Veera');
        expect(result.current.avatarUrl).toBe('https://api.dicebear.com/7.x/bottts/svg?seed=veera');
        expect(result.current.timeZone).toBe('UTC+8 Asia/Shanghai');
    });

    it('should return isAuthenticated as false when accessToken is missing even if user exists', () => {
        const { result } = renderHook(() => useAuth());

        expect(result.current.isAuthenticated).toBe(false);
    });

    it('should return default fallback values when user is null', () => {
        useAuthStore.setState({ user: null });

        const { result } = renderHook(() => useAuth());

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.tenantId).toBeNull();
        expect(result.current.roles).toEqual(['OWNER']);
        expect(result.current.email).toBe('');
        expect(result.current.nickname).toBe('');
        expect(result.current.avatarUrl).toBe('');
        expect(result.current.timeZone).toBe('UTC+8 Asia/Shanghai');
    });

    it('should handle updateProfile success and update store state', async () => {
        mockedUpdateUserProfileApi.mockResolvedValueOnce({ status: 200, data: { message: 'Success' } } as any);

        const mockUpdateState = vi.fn();
        useAuthStore.setState({ updateProfileState: mockUpdateState });

        const { result } = renderHook(() => useAuth());

        let success = false;
        await act(async () => {
            success = await result.current.updateProfile({ nickname: 'NewVeera' });
        });

        expect(mockedUpdateUserProfileApi).toHaveBeenCalledWith({ nickname: 'NewVeera' });
        expect(mockUpdateState).toHaveBeenCalledWith({ nickname: 'NewVeera' });
        expect(success).toBe(true);
    });

    it('should handle updateProfile fallback when server returns non-ok status', async () => {
        mockedUpdateUserProfileApi.mockResolvedValueOnce({ status: 500, data: {} } as any);

        const mockUpdateState = vi.fn();
        useAuthStore.setState({ updateProfileState: mockUpdateState });

        const { result } = renderHook(() => useAuth());

        let success = false;
        await act(async () => {
            success = await result.current.updateProfile({ nickname: 'NewVeera' });
        });

        expect(mockUpdateState).toHaveBeenCalledWith({ nickname: 'NewVeera' });
        expect(success).toBe(true);
    });

    it('should handle updateProfile exception during API call and fall back to local store', async () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        mockedUpdateUserProfileApi.mockRejectedValueOnce(new Error('Network Error'));

        const mockUpdateState = vi.fn();
        useAuthStore.setState({ updateProfileState: mockUpdateState });

        const { result } = renderHook(() => useAuth());

        let success = false;
        await act(async () => {
            success = await result.current.updateProfile({ nickname: 'NewVeera' });
        });

        expect(mockUpdateState).toHaveBeenCalledWith({ nickname: 'NewVeera' });
        expect(success).toBe(true);
        expect(consoleSpy).toHaveBeenCalledWith("API request failed, falling back to local store update:", expect.any(Error));

        consoleSpy.mockRestore();
    });

    it('should handle updatePassword success', async () => {
        mockedUpdateUserPasswordApi.mockResolvedValueOnce({ status: 200, data: { message: 'Success' } } as any);

        const { result } = renderHook(() => useAuth());

        let success = false;
        await act(async () => {
            success = await result.current.updatePassword('Password123', 'NewPass123!');
        });

        expect(mockedUpdateUserPasswordApi).toHaveBeenCalledWith('Password123', 'NewPass123!');
        expect(success).toBe(true);
    });

    it('should handle updatePassword failure on error or exception', async () => {
        mockedUpdateUserPasswordApi.mockRejectedValueOnce(new Error('Password Error'));

        const { result } = renderHook(() => useAuth());

        let success = true;
        await act(async () => {
            success = await result.current.updatePassword('WrongPass', 'NewPass123!');
        });

        expect(success).toBe(false);
    });

    it('should invoke helper update methods (updateNickname, updateTimezone)', async () => {
        mockedUpdateUserProfileApi.mockResolvedValue({ status: 200, data: {} } as any);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.updateNickname('VeeraName');
            await result.current.updateTimezone('UTC+0 UTC');
        });

        expect(mockedUpdateUserProfileApi).toHaveBeenCalledTimes(2);
    });

    it('should update avatar string directly via updateProfile', async () => {
        mockedUpdateUserProfileApi.mockResolvedValueOnce({ status: 200, data: {} } as any);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.updateAvatar('https://avatar.url');
        });

        expect(mockedUpdateUserProfileApi).toHaveBeenCalledWith({ avatarUrl: 'https://avatar.url' });
    });

    it('should upload avatar file via uploadUserAvatarApi and update profile state', async () => {
        mockedUploadUserAvatarApi.mockResolvedValueOnce({
            status: 200,
            data: { avatarUrl: 'https://cdn.example.com/avatar.png' }
        } as any);
        mockedUpdateUserProfileApi.mockResolvedValueOnce({ status: 200, data: {} } as any);

        const { result } = renderHook(() => useAuth());

        const mockFile = new File(['binary'], 'avatar.png', { type: 'image/png' });

        let success = false;
        await act(async () => {
            success = await result.current.updateAvatar(mockFile);
        });

        expect(mockedUploadUserAvatarApi).toHaveBeenCalledWith(mockFile);
        expect(mockedUpdateUserProfileApi).toHaveBeenCalledWith({ avatarUrl: 'https://cdn.example.com/avatar.png' });
        expect(success).toBe(true);
    });

    it('should fall back to local base64 Data URL when upload avatar API fails', async () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        mockedUploadUserAvatarApi.mockRejectedValueOnce(new Error('Upload Error'));
        mockedUpdateUserProfileApi.mockResolvedValueOnce({ status: 200, data: {} } as any);

        const { result } = renderHook(() => useAuth());

        const mockFile = new File(['binary'], 'avatar.png', { type: 'image/png' });

        let success = false;
        await act(async () => {
            success = await result.current.updateAvatar(mockFile);
        });

        expect(mockedUpdateUserProfileApi).toHaveBeenCalledWith({
            avatarUrl: expect.stringMatching(/^data:image\/png;base64,/)
        });
        expect(success).toBe(true);

        consoleSpy.mockRestore();
    });

    it('should trigger logoutAction on calling logout', () => {
        const mockLogout = vi.fn();
        useAuthStore.setState({ logoutAction: mockLogout });

        const { result } = renderHook(() => useAuth());

        act(() => {
            result.current.logout();
        });

        expect(mockLogout).toHaveBeenCalledTimes(1);
    });
});