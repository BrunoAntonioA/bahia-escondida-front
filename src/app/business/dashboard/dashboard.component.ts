import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export default class DashboardComponent {
  ngOnInit() {
    console.log('Dashboard component initialized');
  }
  ngOnDestroy() {
    console.log('Dashboard component destroyed');
  }
}
