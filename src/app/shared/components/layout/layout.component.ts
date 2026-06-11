import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  mobileMenuOpen = false;

  toggleSidebar(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeSidebar(): void {
    this.mobileMenuOpen = false;
  }

  // Corregido: el método recibe el evento pero no es obligatorio usarlo
  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 768) {
      this.mobileMenuOpen = false;
    }
  }
}