import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  @Input() open = false;

  @Output() closed = new EventEmitter<void>();
  @Output() navigated = new EventEmitter<void>();

  constructor(public authService: AuthService) {}

  onClose(): void {
    this.closed.emit();
  }

  onNavigate(): void {
    this.navigated.emit();
  }

  logout(): void {
    this.onNavigate();
    this.authService.logout();
  }
}
