import {
  House,
  Library,
  MessageSquareText,
  Search,
  Cpu,
  Brain,
  File,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  iconOnly?: boolean;
  matchPaths: string[];
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/home',      label: '',        icon: House,             iconOnly: true, matchPaths: ['/home'] },
  { path: '/datasets',  label: 'Dataset', icon: Library,                           matchPaths: ['/datasets'] },
  { path: '/next-chats',     label: 'Chat',    icon: MessageSquareText,                 matchPaths: ['/next-chats'] },
  { path: '/searches',  label: 'Search',  icon: Search,                            matchPaths: ['/searches'] },
  { path: '/agents',    label: 'Agent',   icon: Cpu,                               matchPaths: ['/agents'] },
  { path: '/memories',  label: 'Memory',  icon: Brain,                             matchPaths: ['/memories', '/memory'] },
  { path: '/files',     label: 'File',    icon: File,                              matchPaths: ['/files'] },
];
