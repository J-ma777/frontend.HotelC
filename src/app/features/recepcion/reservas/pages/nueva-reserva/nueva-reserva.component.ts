import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservasService } from '../../services/reservas.service';
@Component({
  selector: 'app-nueva-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nueva-reserva.component.html',
  styleUrl: './nueva-reserva.component.css'
})
export class NuevaReservaComponent {

  private reservaService = inject(ReservasService);
  private router = inject(Router);

  loading = false;
  error: string | null = null;

  reserva = {
    nombreHuesped: '',
    documentoHuesped: '',
    fechaEntrada: '',
    fechaSalida: '',
    cantidadHuespedes: 1,
    tipoHabitacionId: null
  };

  tiposHabitacion = [
    { id: 1, nombre: 'Simple' },
    { id: 2, nombre: 'Doble' },
    { id: 3, nombre: 'Suite' }
  ];

  guardar() {
    if (!this.reserva.nombreHuesped || !this.reserva.documentoHuesped ||
      !this.reserva.fechaEntrada || !this.reserva.fechaSalida || !this.reserva.tipoHabitacionId) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    this.loading = true;
    this.error = null;

    console.log('📤 Enviando reserva:', this.reserva);

    this.reservaService.crearReserva(this.reserva as any).subscribe({
      next: (res: any) => {
        console.log('✅ Reserva creada exitosamente:', res);
        this.router.navigate(['/recepcion/reservas']);
      },
      error: (err: any) => {
        console.error('❌ Error al crear la reserva:', err);
        console.error('Error status:', err.status);
        console.error('Error body:', err.error);
        this.error = 'Error al crear la reserva: ' + (err.error?.message || err.message || 'Intenta de nuevo');
        this.loading = false;
      }
    });
  }

  cancelar() {
    this.router.navigate(['/recepcion/reservas']);
  }
}
