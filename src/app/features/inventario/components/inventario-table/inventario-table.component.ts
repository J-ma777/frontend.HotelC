import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ArticuloInventario } from '../../models/articulo-inventario.model';

@Component({
  selector: 'app-inventario-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventario-table.component.html',
  styleUrls: ['./inventario-table.component.css']
})
export class InventarioTableComponent {

  @Input() articulos: ArticuloInventario[] = [];
  @Input() loading = false;

  @Output() entrada = new EventEmitter<ArticuloInventario>();
  @Output() salida = new EventEmitter<ArticuloInventario>();
  @Output() ajustar = new EventEmitter<ArticuloInventario>();
  
  constructor(private router: Router) {}

  getEstado(articulo: ArticuloInventario): 'NORMAL' | 'BAJO' | 'ADVERTENCIA' {
    const stockActual = Number((articulo as any)?.stockActual ?? 0);
    const stockMinimo = Number((articulo as any)?.stockMinimo ?? 0);
    if (stockActual <= stockMinimo) return 'BAJO';
    if (stockActual <= stockMinimo * 1.2) return 'ADVERTENCIA';
    return 'NORMAL';
  }

  onEntrada(a: ArticuloInventario) {
    this.entrada.emit(a);
  }

  onSalida(a: ArticuloInventario) {
    this.salida.emit(a);
  }

  onAjustar(a: ArticuloInventario) {
    this.ajustar.emit(a);
  }

  onVerMovimientos(a: ArticuloInventario) {
    // Compatibilidad: el backend podría devolver la clave como id, articuloId o _id
    const anyA = a as any;
    const id = anyA.id ?? anyA.articuloId ?? anyA._id;
    if (!id) {
      console.warn('[InventarioTable] artículo sin id:', a);
      return;
    }
    this.router.navigate(['/inventario/articulo', id]);
  }
}

export {};