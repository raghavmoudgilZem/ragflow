import { Routes } from '@angular/router';
import { SearchComponent } from './pages/search/search.component';
import { SearchDetailComponent } from './pages/search-detail/search-detail.component';

export const SEARCH_ROUTES: Routes = [
  {
    path: '',
    component: SearchComponent,
  },
  {
    path: ':id',
    component: SearchDetailComponent,
  },
];