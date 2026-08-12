import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { TeamMembersTable } from './TeamMembersTable';
import type { TenantMember } from '../types/tenant.types';

describe('TeamMembersTable Component', () => {
    const mockOnSelectRemove = vi.fn();

    it('should display structural table headers and fall back to the "No data available" row when data array is empty', () => {
        render(<TeamMembersTable data={[]} onSelectRemove={mockOnSelectRemove} />);

        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Date↑↓')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('State')).toBeInTheDocument();
        expect(screen.getByText('Action')).toBeInTheDocument();
        expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('should render roster rows accurately with custom member text properties', () => {
        const mockMembers: TenantMember[] = [
            {
                id: 'mem-01',
                userId: 'usr-mock-01',
                name: 'Veera Dev',
                email: 'veera@zemosolabs.com',
                joinedAt: '14/07/2026',
                role: 'MEMBER' as any,
                status: 'ACTIVE' as any
            }
        ];

        render(<TeamMembersTable data={mockMembers} onSelectRemove={mockOnSelectRemove} />);

        expect(screen.getByText('Veera Dev')).toBeInTheDocument();
        expect(screen.getByText('14/07/2026')).toBeInTheDocument();
        expect(screen.getByText('veera@zemosolabs.com')).toBeInTheDocument();
        expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    });

    it('should assign a green style format for ACTIVE users and a different color profile for pending accounts', () => {
        const heterogeneousMembers: TenantMember[] = [
            {
                id: 'mem-active',
                userId: 'usr-mock-active',
                name: 'Active User',
                email: 'active@zemoso.com',
                joinedAt: '15/07/2026',
                role: 'MEMBER' as any,
                status: 'ACTIVE' as any
            },
            {
                id: 'mem-pending',
                userId: 'usr-mock-pending',
                name: 'Pending User',
                email: 'pending@zemoso.com',
                joinedAt: '16/07/2026',
                role: 'MEMBER' as any,
                status: 'PENDING' as any
            }
        ];

        render(<TeamMembersTable data={heterogeneousMembers} onSelectRemove={mockOnSelectRemove} />);

        const activeCell = screen.getByText('ACTIVE');
        const pendingCell = screen.getByText('PENDING');

        expect(activeCell).toHaveStyle({ color: '#10b981' });
        expect(pendingCell).toHaveStyle({ color: '#f59e0b' });
    });

    it('should execute the onSelectRemove callback carrying the precise record payload when a delete action button is clicked', () => {
        const targetMember: TenantMember = {
            id: 'mem-delete-target',
            userId: 'usr-mock-delete',
            name: 'John Doe',
            email: 'john@zemosolabs.com',
            joinedAt: '17/07/2026',
            role: 'MEMBER' as any,
            status: 'ACTIVE' as any
        };

        render(<TeamMembersTable data={[targetMember]} onSelectRemove={mockOnSelectRemove} />);

        const deleteButton = screen.getByRole('button');
        fireEvent.click(deleteButton);

        expect(mockOnSelectRemove).toHaveBeenCalledTimes(1);
        expect(mockOnSelectRemove).toHaveBeenCalledWith(targetMember);
    });
});