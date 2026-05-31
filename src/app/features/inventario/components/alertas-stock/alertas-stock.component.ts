import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticuloInventario } from '../../models/articulo-inventario.model';

@Component({
  selector: 'app-alertas-stock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alertas-stock.component.html',
  styleUrls: ['./alertas-stock.component.css']
})
export class AlertasStockComponent {

  @Input() alertas: ArticuloInventario[] = [];

  @Output() entrada = new EventEmitter<ArticuloInventario>();

  getCriticos(): number {
    return this.alertas.length;
  }

  onEntrada(articulo: ArticuloInventario) {
    this.entrada.emit(articulo);
  }
}

export {};