import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  habitaciones = [
    {
      nombre: 'Premium Double',
      precio: 450,
      etiqueta: 'AVAILABLE',
      tipoEtiqueta: 'available',
      descripcion: 'GARDEN VIEW • 42 M²',
      imagen: 'https://images.unsplash.com/photo-1618773928120-2e15dc3ce8aa?q=80&w=2070&auto=format&fit=crop'
    },
    {
      nombre: 'Executive Suite',
      precio: 890,
      etiqueta: 'VIP PRIORITY',
      tipoEtiqueta: 'vip',
      descripcion: 'OCEAN FRONT • 78 M²',
      imagen: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070&auto=format&fit=crop'
    },
    {
      nombre: 'Presidential Loft',
      precio: 1500,
      etiqueta: '2 LEFT',
      tipoEtiqueta: 'danger',
      descripcion: 'SKYLINE VIEW • 120 M²',
      imagen: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop'
    }
  ];
}
