import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JoinedTeamsTable } from './JoinedTeamsTable';
import { useAuthStore } from '../store/useAuthStore';
import type { JoinedTeam } from '../types/tenant.types';

describe('JoinedTeamsTable Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuthStore.setState({ user: null });
    });

    it('should display table headers and show "No data available" when data array is completely empty', () => {
        render(<JoinedTeamsTable data={[]} />);

        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Date↑↓')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('Action')).toBeInTheDocument();
        expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('should render rows accurately using custom explicit email properties attached to the data node', () => {
        const mockTeams: (JoinedTeam & { email?: string })[] = [
            {
                tenantId: 'tn-alpha',
                tenantName: 'Alpha Workspace',
                tenantCode: 'AW',
                role: 'MEMBER',
                joinedAt: '12/05/2026',
                email: 'explicit-team-contact@zemosolabs.com'
            }
        ];

        render(<JoinedTeamsTable data={mockTeams} />);

        expect(screen.getByText('Alpha Workspace')).toBeInTheDocument();
        expect(screen.getByText('12/05/2026')).toBeInTheDocument();
        expect(screen.getByText('explicit-team-contact@zemosolabs.com')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /quit/i })).toBeInTheDocument();
    });

    it('should fallback to using the logged-in Zustand store user email if the individual team email field is absent', () => {
        useAuthStore.setState({
            user: {
                id: 'usr-88',
                email: 'logged-in-user@zemosolabs.com',
                nickname: 'Veera',
                name: 'Veera',
                currentTenantId: 'tn-beta'
            }
        });

        const mockTeamsWithoutEmail: JoinedTeam[] = [
            {
                tenantId: 'tn-beta',
                tenantName: 'Beta Systems',
                tenantCode: 'BS',
                role: 'OWNER',
                joinedAt: '17/07/2026'
            }
        ];

        render(<JoinedTeamsTable data={mockTeamsWithoutEmail} />);

        expect(screen.getByText('Beta Systems')).toBeInTheDocument();
        expect(screen.getByText('17/07/2026')).toBeInTheDocument();
        expect(screen.getByText('logged-in-user@zemosolabs.com')).toBeInTheDocument();
    });

    it('should render a text dash symbol "-" if both team email fields and store user records are fully missing', () => {
        useAuthStore.setState({ user: null });

        const mockMinimalTeams: JoinedTeam[] = [
            {
                tenantId: 'tn-gamma',
                tenantName: 'Gamma Workspace',
                tenantCode: 'GW',
                role: 'MEMBER',
                joinedAt: '01/01/2026'
            }
        ];

        render(<JoinedTeamsTable data={mockMinimalTeams} />);

        expect(screen.getByText('Gamma Workspace')).toBeInTheDocument();
        expect(screen.getByText('-')).toBeInTheDocument();
    });
});