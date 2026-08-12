import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Box,
    Typography,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { TenantMember } from '../types/tenant.types';

interface TeamMembersTableProps {
    data: TenantMember[];
    onSelectRemove: (member: TenantMember) => void;
}

export const TeamMembersTable: React.FC<TeamMembersTableProps> = ({ data, onSelectRemove }) => {
    return (
        <TableContainer sx={{ border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '6px', backgroundColor: '#111112', overflow: 'hidden' }}>
            <Table size="small" sx={{ width: '100%', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <Box component="thead" sx={{ backgroundColor: '#38383a' }}>
                    <TableRow>
                        <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #27272a', fontWeight: 500, fontSize: '0.95rem', py: 1.5 }}>Name</TableCell>
                        <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #27272a', fontWeight: 500, fontSize: '0.95rem', py: 1.5 }}>Date↑↓</TableCell>
                        <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #27272a', fontWeight: 500, fontSize: '0.95rem', py: 1.5 }}>Email</TableCell>
                        <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #27272a', fontWeight: 500, fontSize: '0.95rem', py: 1.5 }}>State</TableCell>
                        <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #27272a', fontWeight: 500, fontSize: '0.95rem', py: 1.5 }}>Action</TableCell>
                    </TableRow>
                </Box>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ border: '1px solid rgba(255, 255, 255, 0.2)', py: 6, '&:hover': { backgroundColor: '#161618' } }}>
                                <Typography sx={{ color: '#ffffff', fontSize: '0.85rem', }}>
                                    No data available
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((member) => (
                            <TableRow key={member.id} sx={{ '&:hover': { backgroundColor: '#161618' } }}>
                                <TableCell sx={{ color: '#ffffff', borderBottom: '1px solid #27272a', fontSize: '0.85rem' }}>{member.name}</TableCell>
                                <TableCell sx={{ color: '#ffffff', borderBottom: '1px solid #27272a', fontSize: '0.85rem' }}>{member.joinedAt}</TableCell>
                                <TableCell sx={{ color: '#ffffff', borderBottom: '1px solid #27272a', fontSize: '0.85rem' }}>{member.email}</TableCell>
                                <TableCell sx={{ color: member.status === 'ACTIVE' ? '#10b981' : '#f59e0b', borderBottom: '1px solid #27272a', fontWeight: 500, fontSize: '0.85rem' }}>
                                    {member.status}
                                </TableCell>
                                <TableCell sx={{ borderBottom: '1px solid #27272a' }}>
                                    <IconButton onClick={() => onSelectRemove(member)} sx={{ color: '#71717a', p: 0.5, '&:hover': { color: '#ef4444' } }}>
                                        <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};