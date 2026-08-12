import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { AdminLayoutComponent } from './core/layout/admin-layout/admin-layout.component';
import { UserListComponent } from './features/admin/users/pages/user-list/user-list.component';
import { Dashboard } from './features/user/dashboard/pages/dashboard/dashboard';
import { ServiceStatusList } from './features/admin/service-status/pages/service-status-list/service-status-list';
import { authGuard } from './core/auth/auth-guard';
import { roleGuard } from './core/auth/role-guard';
import { HomeComponent } from './features/user/home/pages/home/home.component';
import { DatasetComponent } from './features/user/dataset/pages/dataset/dataset.component';
import { ChatComponent } from './features/user/chat/pages/chat/chat.component';
import { SearchComponent } from './features/user/search/pages/search/search.component';
import { AgentComponent } from './features/user/agent/pages/agent/agent.component';
import { AgentEditorComponent } from './features/user/agent/pages/agent-editor/agent-editor.component';
import { MemoryComponent } from './features/user/memory/pages/memory/memory.component';
import { FileComponent } from './features/user/file/pages/file/file.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: 'service-status', component: ServiceStatusList },

      { path: 'users', component: UserListComponent },

      { path: '', redirectTo: 'service-status', pathMatch: 'full' },
    ],
  },
  {
    path: 'dashboard',
    component: Dashboard,
    // canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'dataset', component: DatasetComponent },
      { path: 'chat', component: ChatComponent },
      { path: 'search', component: SearchComponent },
      { path: 'agent', component: AgentComponent },
      { path: 'agent/:id', component: AgentEditorComponent },
      { path: 'memory', component: MemoryComponent },
      { path: 'file', component: FileComponent },
    ],
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
