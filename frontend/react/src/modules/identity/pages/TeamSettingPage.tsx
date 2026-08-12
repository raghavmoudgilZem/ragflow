import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';

import { SearchInput } from '../../../shared/components/UI/SearchInput';
import { TeamMembersTable } from '../components/TeamMembersTable';
import { JoinedTeamsTable } from '../components/JoinedTeamsTable';
import { InviteMemberModal } from '../components/InviteMemberModal';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { useTenantManagement } from '../hooks/useTenantManagement';
import type { TenantMember } from '../types/tenant.types';

export const TeamSettingsPage: React.FC = () => {
    const {
        membersList,
        joinedTeamsList,
        inviteMemberAction,
        removeMemberAction
    } = useTenantManagement();

    const [inviteOpen, setInviteOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<TenantMember | null>(null);

    const [memberQuery, setMemberQuery] = useState('');
    const [teamQuery, setTeamQuery] = useState('');

    // ✅ FIXED: Removed immediate execution so it only sets state variables and triggers the popup display
    const handleDeleteTrigger = (member: TenantMember) => {
        setSelectedMember(member);
        setDeleteOpen(true);
    };

    const filteredMembers = membersList.filter(m =>
        m.name?.toLowerCase().includes(memberQuery.toLowerCase()) ||
        m.email?.toLowerCase().includes(memberQuery.toLowerCase())
    );

    const filteredTeams = joinedTeamsList.filter(t =>
        t.tenantName?.toLowerCase().includes(teamQuery.toLowerCase())
    );

    return (
        <Box
            sx={{
                display: 'flex',
                width: '100%',
                boxSizing: 'border-box',
                padding: '24px',
                backgroundColor: '#09090b',
            }}
        >
            <Box
                sx={{
                    flexGrow: 1,
                    padding: '32px',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    minHeight: 'calc(100vh - 48px)',
                    overflowY: 'auto',
                    background: 'radial-gradient(circle at 50% 190%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 60%), #141416',
                    pointerEvents: 'auto',
                }}
            >
                <Box
                    sx={{
                        borderBottom: '1px solid #27272a',
                        pb: 2,
                        mb: 2,
                        mx: '-32px',
                        px: '32px'
                    }}
                >
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#ffffff', fontSize: '1.25rem' }}>
                        veera workspace
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            px: 0,
                            boxSizing: 'border-box'
                        }}
                    >
                        <Typography
                            sx={{
                                fontWeight: 600,
                                color: '#ffffff',
                                fontSize: '1rem',
                                lineHeight: '1.5rem',
                                letterSpacing: '-0.025em'
                            }}
                        >
                            Team members
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <SearchInput
                                placeholder="Search"
                                value={memberQuery}
                                onChange={(e) => setMemberQuery(e.target.value)}
                            />

                            <Button
                                variant="contained"
                                startIcon={<PersonAddOutlinedIcon sx={{ fontSize: '1rem' }} />}
                                onClick={() => setInviteOpen(true)}
                                sx={{
                                    backgroundColor: '#ffffff',
                                    color: '#000000',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.8rem',
                                    height: '32px',
                                    padding: '0 12px',
                                    borderRadius: '4px',
                                    '&:hover': { backgroundColor: '#e4e4e7' }
                                }}
                            >
                                Invite member
                            </Button>
                        </Box>
                    </Box>

                    <TeamMembersTable data={filteredMembers} onSelectRemove={handleDeleteTrigger} />
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            px: 0,
                            boxSizing: 'border-box'
                        }}
                    >
                        <Typography
                            sx={{
                                fontWeight: 600,
                                color: '#ffffff',
                                fontSize: '1rem',
                                lineHeight: '1.5rem',
                                letterSpacing: '-0.025em'
                            }}
                        >
                            Joined teams
                        </Typography>

                        <SearchInput
                            placeholder="Search"
                            value={teamQuery}
                            onChange={(e) => setTeamQuery(e.target.value)}
                        />
                    </Box>

                    <JoinedTeamsTable data={filteredTeams} />
                </Box>
            </Box>

            <InviteMemberModal
                open={inviteOpen}
                onClose={() => setInviteOpen(false)}
                onInviteSubmit={inviteMemberAction}
            />

            {/* ✅ FIXED: Enhanced the callback to automatically map alternative identification variables */}
            <DeleteConfirmationModal
                open={deleteOpen}
                onClose={() => {
                    setDeleteOpen(false);
                    setSelectedMember(null);
                }}
                targetName={selectedMember?.name || ''}
                onConfirm={async () => {
                    if (selectedMember) {
                        // Safe fallback check across conventional identifier options
                        const targetId = selectedMember.id || (selectedMember as any).userId || (selectedMember as any)._id;
                        return await removeMemberAction(targetId);
                    }
                    return false;
                }}
            />
        </Box>
    );
};