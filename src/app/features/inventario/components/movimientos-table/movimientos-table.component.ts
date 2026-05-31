import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Movimiento } from '../../models/movimiento.model';

@Component({
  selector: 'app-movimientos-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movimientos-table.component.html',
  styleUrls: ['./movimientos-table.component.css']
})
export class MovimientosTableComponent implements OnChanges {

  @Input() movimientos: Movimiento[] = [];
  @Input() loading = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['movimientos']) {
      const current = changes['movimientos'].currentValue as Movimiento[] | null | undefined;
      console.log('[MovimientosTable] input movimientos actualizado:', current?.length ?? 0);
    }
  }

  getClaseTipo(tipo: string): string {
    switch (tipo) {
      case 'ENTRADA': return 'entrada';
      case 'SALIDA': return 'salida';
      case 'AJUSTE': return 'ajuste';
      default: return '';
    }
  }

  getSigno(tipo: string): string {
    return tipo === 'ENTRADA' ? '+' : '-';
  }
}

export {};