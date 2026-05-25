import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @Output() menuClick = new EventEmitter<void>();

  constructor(public authService: AuthService) {}
}
