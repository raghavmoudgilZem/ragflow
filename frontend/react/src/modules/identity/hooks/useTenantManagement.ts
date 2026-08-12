import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import type { TenantMember, JoinedTeam, TenantRole } from '../types/tenant.types';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api/v1';

export const useTenantManagement = () => {
    const refreshTenantContext = useAuthStore((state) => state.refreshTenantContext);
    const currentUser = useAuthStore((state) => state.user);
    const tenantId = currentUser?.currentTenantId ?? 'tn-01';

    const [membersList, setMembersList] = useState<TenantMember[]>([]);
    const [joinedTeamsList, setJoinedTeamsList] = useState<JoinedTeam[]>([]);
    const [isFetchLoading, setIsFetchLoading] = useState<boolean>(false);
    const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const fetchTenantData = async () => {
        if (!tenantId) return;
        setIsFetchLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/tenants/${tenantId}/users`);
            const { members } = response.data;

            setMembersList(members || []);
            setApiError(null);

            const establishedJoinedTeams: JoinedTeam[] = [
                {
                    tenantId: tenantId,
                    tenantName: 'veera workspace',
                    tenantCode: 'VW',
                    role: 'OWNER' as TenantRole,
                    joinedAt: '14/07/2026 20:21:52'
                }
            ];
            setJoinedTeamsList(establishedJoinedTeams);
        } catch (err: any) {
            const caughtError = err.response?.data?.message || err.response?.data?.error || 'Failed to sync roster rows.';
            setApiError(caughtError);
        } finally {
            setIsFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchTenantData();
    }, [tenantId]);

    const inviteMemberAction = async (email: string) => {
        setIsActionLoading(true);
        setApiError(null);
        try {
            await axios.post(`${API_BASE_URL}/tenants/${tenantId}/users`, {
                email,
                nickname: email.split('@')[0],
                role: 'MEMBER'
            });

            await fetchTenantData();
            return true;
        } catch (err: any) {
            const backendErrorNotice = err.response?.data?.message || err.response?.data?.error || 'Failed to dispatch workspace invitation.';
            setApiError(backendErrorNotice);

            alert(backendErrorNotice);
            return false;
        } finally {
            setIsActionLoading(false);
        }
    };

    const removeMemberAction = async (memberId: string) => {
        setIsActionLoading(true);
        try {
            await axios.delete(`${API_BASE_URL}/tenants/${tenantId}/users/${memberId}`);
            await fetchTenantData();
            return true;
        } catch (err: any) {
            const deleteErrorNotice = err.response?.data?.message || err.response?.data?.error || 'Failed to clean relationship map.';
            setApiError(deleteErrorNotice);

            alert(deleteErrorNotice);
            return false;
        } finally {
            setIsActionLoading(false);
        }
    };

    return {
        membersList,
        joinedTeamsList,
        isFetchLoading,
        isActionLoading,
        apiError,
        inviteMemberAction,
        removeMemberAction
    };
};