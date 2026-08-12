import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Box,
    Typography,
    Button
} from '@mui/material';
import type { JoinedTeam } from '../types/tenant.types';
import { useAuthStore } from '../store/useAuthStore';

interface JoinedTeamsTableProps {
    data: JoinedTeam[];
}

export const JoinedTeamsTable: React.FC<JoinedTeamsTableProps> = ({ data }) => {
    const currentUser = useAuthStore((state) => state.user);

    return (
        <TableContainer sx={{ border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '6px', backgroundColor: '#111112', overflow: 'hidden' }}>
            <Table size="small" sx={{ width: '100%', border: '1px solid rgba(255, 255, 255, 0.2)', tableLayout: 'fixed' }}>
                <Box component="thead" sx={{ backgroundColor: '#38383a' }}>
                    <TableRow>
                        <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #27272a', fontWeight: 500, fontSize: '0.95rem', py: 1.5, width: '22%' }}>Name</TableCell>
                        <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #27272a', fontWeight: 500, fontSize: '0.95rem', py: 1.5, width: '20%' }}>Date↑↓</TableCell>
                        <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #27272a', fontWeight: 500, fontSize: '0.95rem', py: 1.5, width: '48%' }}>Email</TableCell>
                        <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #27272a', fontWeight: 500, fontSize: '0.95rem', py: 1.5, width: '10%' }}>Action</TableCell>
                    </TableRow>
                </Box>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 6, '&:hover': { backgroundColor: '#161618' } }}>
                                <Typography sx={{ color: '#ffffff', fontSize: '0.85rem' }}>
                                    No data available
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((team) => (
                            <TableRow key={team.tenantId} sx={{ '&:hover': { backgroundColor: '#161618' } }}>
                                <TableCell sx={{ color: '#ffffff', borderBottom: '1px solid #27272a', fontSize: '0.85rem', padding: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.tenantName}</TableCell>
                                <TableCell sx={{ color: '#ffffff', borderBottom: '1px solid #27272a', fontSize: '0.85rem' }}>{team.joinedAt}</TableCell>
                                {/* ✅ FIXED: Dynamically pulls the email attribute or fallbacks straight to the active user's email */}
                                <TableCell sx={{ color: '#ffffff', borderBottom: '1px solid #27272a', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {(team as any).email || currentUser?.email || '-'}
                                </TableCell>
                                <TableCell sx={{ borderBottom: '1px solid #27272a' }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            borderColor: '#27272a',
                                            color: '#ffffff',
                                            textTransform: 'none',
                                            fontSize: '0.75rem',
                                            height: '24px',
                                            padding: '0 8px',
                                            '&:hover': { borderColor: '#444446', backgroundColor: '#1c1c1f' }
                                        }}
                                    >
                                        Quit
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};