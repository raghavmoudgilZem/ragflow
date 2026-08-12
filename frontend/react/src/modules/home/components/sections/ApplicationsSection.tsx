import { Box, Skeleton, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { Cpu, MessageSquareText, Search } from 'lucide-react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomeAgents } from '../../hooks/useHomeAgents';
import { useHomeChats } from '../../hooks/useHomeChats';
import { useHomeUiStore } from '../../store/homeUiStore';
import {
  agentToCardData,
  chatToCardData,
  type ApplicationTab,
} from '../../types/home.types';
import { EmptyStateCard } from '../cards/EmptyStateCard';
import { HomeEntryCard } from '../cards/HomeEntryCard';
import { SeeAllCard } from '../cards/SeeAllCard';
import { CardGrid } from '../layout/CardGrid';

interface TabConfig {
  label: string;
  icon: React.ReactNode;
  href: string;
  createLabel: string;
}

const TAB_CONFIG: Record<ApplicationTab, TabConfig> = {
  chat: {
    label: 'Chat Apps',
    icon: <MessageSquareText size={24} />,
    href: '/chats',
    createLabel: 'No chats yet. Create your first one.',
  },
  agent: {
    label: 'Agents',
    icon: <Cpu size={24} />,
    href: '/agents',
    createLabel: 'No agents yet. Create your first one.',
  },
  search: {
    label: 'Search Apps',
    icon: <Search size={24} />,
    href: '/searches',
    createLabel: 'No searches yet. Create your first one.',
  },
};

const TABS: ApplicationTab[] = ['chat', 'agent', 'search'];

export const ApplicationsSection = () => {
  const { activeTab, setActiveTab } = useHomeUiStore();
  const navigate = useNavigate();

  const { data: chats, isLoading: chatsLoading } = useHomeChats();
  const { data: agents, isLoading: agentsLoading } = useHomeAgents();

  const config = TAB_CONFIG[activeTab];

  const isLoading =
    activeTab === 'chat'
      ? chatsLoading
      : activeTab === 'agent'
        ? agentsLoading
        : false;

  const items =
    activeTab === 'chat'
      ? (chats ?? []).map(chatToCardData)
      : activeTab === 'agent'
        ? (agents ?? []).map(agentToCardData)
        : [];

  return (
    <Box sx={(theme) => ({ marginBottom: theme.spacing(6) })}>
      {/* Header row: icon+label left, tabs right */}
      <Box
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing(2),
        })}
      >
        <Box sx={(theme) => ({ display: 'flex', alignItems: 'center', gap: theme.spacing(1) })}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'var(--text-h)' }}>
            {config.icon}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--text-h)' }}>
            {config.label}
          </Typography>
        </Box>

        <ToggleButtonGroup
          value={activeTab}
          exclusive
          onChange={(_: React.MouseEvent<HTMLElement>, val: ApplicationTab | null) => {
            if (val) setActiveTab(val);
          }}
          size="small"
          sx={(theme) => ({
            bgcolor: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)',
            borderRadius: 2,
            p: '0.125rem',
            gap: '0.125rem',
            '& .MuiToggleButtonGroup-grouped': {
              border: 'none !important',
              borderRadius: '0.375rem !important',
              marginLeft: 0,
              marginRight: 0,
            },
            '& .MuiToggleButton-root': {
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2),
              paddingTop: theme.spacing(0.5),
              paddingBottom: theme.spacing(0.5),
              fontSize: '0.78rem',
              fontWeight: 500,
              textTransform: 'none',
              color: 'var(--text)',
              '&.Mui-selected': {
                bgcolor: 'rgba(255,255,255,0.10)',
                color: 'var(--text-h)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.14)' },
              },
              '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
            },
          })}
        >
          {TABS.map((tab) => (
            <ToggleButton key={tab} value={tab}>
              {TAB_CONFIG[tab].label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {isLoading ? (
        <Skeleton
          variant="rectangular"
          height={128}
          sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)' }}
        />
      ) : items.length === 0 ? (
        <CardGrid>
          <EmptyStateCard
            label={config.createLabel}
            onCreateClick={() => navigate(`${config.href}?isCreate=true`)}
          />
        </CardGrid>
      ) : (
        <CardGrid>
          {items.map((item) => (
            <HomeEntryCard
              key={item.id}
              data={item}
              icon={config.icon}
              onClick={() => navigate(`${config.href}/${item.id}`)}
            />
          ))}
          <SeeAllCard href={config.href} />
        </CardGrid>
      )}
    </Box>
  );
};
