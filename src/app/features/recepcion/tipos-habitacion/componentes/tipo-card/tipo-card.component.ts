import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TipoHabitacion } from '../../../../../core/models/tipo-habitacion.model';

@Component({
  selector: 'app-tipo-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tipo-card.component.html',
  styleUrls: ['./tipo-card.component.css']
})
export class TipoCardComponent {
  @Input() tipo!: TipoHabitacion;

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/login.webp';
  }

  formatId(id: number): string {
    const s = id?.toString() ?? '0';
    return 'RT-' + s.padStart(3, '0');
  }
}
