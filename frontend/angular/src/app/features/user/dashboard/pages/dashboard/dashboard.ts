import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationHeaderComponent } from '../../components/navigation-header/navigation-header.component';

@Component({
  selector: 'app-dashboard',
  imports: [NavigationHeaderComponent, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}
