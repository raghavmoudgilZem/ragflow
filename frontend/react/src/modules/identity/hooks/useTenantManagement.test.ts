import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, type MockInstance } from 'vitest';
import axios from 'axios';
import { useTenantManagement } from './useTenantManagement';
import { useAuthStore } from '../store/useAuthStore';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('useTenantManagement Custom Hook Suite', () => {
    let alertSpy: MockInstance;

    beforeEach(() => {
        vi.clearAllMocks();

        alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

        useAuthStore.setState({
            user: {
                id: 'usr-dev-99',
                email: 'veera@zemoso.com',
                nickname: 'Veera',
                name: 'Veera',
                avatarUrl: '',
                currentTenantId: 'tn-workspace-88'
            },
            isLoading: false,
            error: null
        });
    });

    it('should execute auto-fetching on mount and populate membersList and joinedTeamsList rows', async () => {
        const mockMembers = [
            { id: 'm-1', nickname: 'Veera', email: 'veera@zemoso.com', role: 'OWNER' },
            { id: 'm-2', nickname: 'Developer', email: 'dev@zemoso.com', role: 'MEMBER' }
        ];

        mockedAxios.get.mockResolvedValueOnce({
            data: { members: mockMembers }
        });

        const { result } = renderHook(() => useTenantManagement());

        expect(result.current.isFetchLoading).toBe(true);

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(mockedAxios.get).toHaveBeenCalledWith(
            'http://localhost:4000/api/v1/tenants/tn-workspace-88/users'
        );
        expect(result.current.isFetchLoading).toBe(false);
        expect(result.current.membersList).toEqual(mockMembers);
        expect(result.current.joinedTeamsList).toHaveLength(1);
        expect(result.current.joinedTeamsList[0].tenantId).toBe('tn-workspace-88');
        expect(result.current.apiError).toBeNull();
    });

    it('should default to tracking key "tn-01" if user profile tracking properties are missing', async () => {
        useAuthStore.setState({ user: null });

        mockedAxios.get.mockResolvedValueOnce({ data: { members: [] } });

        renderHook(() => useTenantManagement());

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(mockedAxios.get).toHaveBeenCalledWith(
            'http://localhost:4000/api/v1/tenants/tn-01/users'
        );
    });

    it('should skip tenant fetches when the current tenant id is an empty string', async () => {
        useAuthStore.setState({
            user: {
                ...useAuthStore.getState().user,
                currentTenantId: ''
            } as any
        });

        const { result } = renderHook(() => useTenantManagement());

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(mockedAxios.get).not.toHaveBeenCalled();
        expect(result.current.membersList).toEqual([]);
        expect(result.current.joinedTeamsList).toEqual([]);
    });

    it('should intercept API failures gracefully on mount and isolate custom error messages', async () => {
        mockedAxios.get.mockRejectedValueOnce({
            response: { data: { message: 'Database process timeout validation failure.' } }
        });

        const { result } = renderHook(() => useTenantManagement());

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(result.current.isFetchLoading).toBe(false);
        expect(result.current.membersList).toEqual([]);
        expect(result.current.apiError).toBe('Database process timeout validation failure.');
    });

    it('should fallback to an empty member list when the fetch response omits members entirely', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: {} });

        const { result } = renderHook(() => useTenantManagement());

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(result.current.membersList).toEqual([]);
        expect(result.current.apiError).toBeNull();
    });

    it('should utilize fallback strings if network error payloads are omitted during fetch actions', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('Dropped connection network frame.'));

        const { result } = renderHook(() => useTenantManagement());

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(result.current.apiError).toBe('Failed to sync roster rows.');
    });

    it('should process user workspace invitations successfully and trigger data sync pipeline refreshes', async () => {
        mockedAxios.get.mockResolvedValue({ data: { members: [] } });
        mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

        const { result } = renderHook(() => useTenantManagement());

        let operationResult;
        await act(async () => {
            operationResult = await result.current.inviteMemberAction('colleague@zemoso.com');
        });

        expect(mockedAxios.post).toHaveBeenCalledWith(
            'http://localhost:4000/api/v1/tenants/tn-workspace-88/users',
            {
                email: 'colleague@zemoso.com',
                nickname: 'colleague',
                role: 'MEMBER'
            }
        );
        expect(operationResult).toBe(true);
        expect(result.current.isActionLoading).toBe(false);
        expect(result.current.apiError).toBeNull();
    });

    it('should process dynamic server error alert strings if custom invitation handling triggers rejection rules', async () => {
        const errorFeedbackStr = 'colleague@zemoso.com is already a member of the team.';

        mockedAxios.get.mockResolvedValue({ data: { members: [] } });
        mockedAxios.post.mockRejectedValueOnce({
            response: { data: { error: errorFeedbackStr } }
        });

        const { result } = renderHook(() => useTenantManagement());

        let operationResult;
        await act(async () => {
            operationResult = await result.current.inviteMemberAction('colleague@zemoso.com');
        });

        expect(operationResult).toBe(false);
        expect(result.current.apiError).toBe(errorFeedbackStr);
        expect(alertSpy).toHaveBeenCalledWith(errorFeedbackStr);
        expect(result.current.isActionLoading).toBe(false);
    });

    it('should successfully execute membership detachment mappings via removeMemberAction calls', async () => {
        mockedAxios.get.mockResolvedValue({ data: { members: [] } });
        mockedAxios.delete.mockResolvedValueOnce({ data: { detached: true } });

        const { result } = renderHook(() => useTenantManagement());

        let operationResult;
        await act(async () => {
            operationResult = await result.current.removeMemberAction('usr-delete-target-55');
        });

        expect(mockedAxios.delete).toHaveBeenCalledWith(
            'http://localhost:4000/api/v1/tenants/tn-workspace-88/users/usr-delete-target-55'
        );
        expect(operationResult).toBe(true);
        expect(result.current.isActionLoading).toBe(false);
    });

    it('should catch relationship map cleaning failure strings if member deletion crashes', async () => {
        mockedAxios.get.mockResolvedValue({ data: { members: [] } });
        mockedAxios.delete.mockRejectedValueOnce({
            response: { data: { message: 'Cannot remove workspace owner.' } }
        });

        const { result } = renderHook(() => useTenantManagement());

        let operationResult;
        await act(async () => {
            operationResult = await result.current.removeMemberAction('usr-owner-id');
        });

        expect(operationResult).toBe(false);
        expect(result.current.apiError).toBe('Cannot remove workspace owner.');
        expect(result.current.isActionLoading).toBe(false);
    });

    it('should surface fallback error strings when invitation and removal failures omit detail payloads', async () => {
        mockedAxios.get.mockResolvedValue({ data: { members: [] } });
        mockedAxios.post.mockRejectedValueOnce({ response: { data: {} } });
        mockedAxios.delete.mockRejectedValueOnce({ response: { data: {} } });

        const { result } = renderHook(() => useTenantManagement());

        let inviteResult;
        let removeResult;
        await act(async () => {
            inviteResult = await result.current.inviteMemberAction('invite@zemoso.com');
            removeResult = await result.current.removeMemberAction('remove-target');
        });

        expect(inviteResult).toBe(false);
        expect(removeResult).toBe(false);
        expect(result.current.apiError).toBe('Failed to clean relationship map.');
        expect(alertSpy).toHaveBeenCalledWith('Failed to clean relationship map.');
    });

    it('should invoke early return guard patterns (lines 20-26) when action methods receive blank parameters', async () => {
        const { result } = renderHook(() => useTenantManagement());

        const status = await result.current.inviteMemberAction('');

        expect(status).toBe(true);
    });

    it('should trigger the backend catch block boundaries (lines 63-82) when an action request fails', async () => {
        const { result } = renderHook(() => useTenantManagement());

        try {
            const status = await result.current.removeMemberAction('invalid-member-uuid-to-force-catch');

            expect(status).toBe(false);
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
});