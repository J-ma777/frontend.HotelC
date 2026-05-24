import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Ticket, Habitacion, Empleado } from '../models/ticket.model';
import { TicketsService } from '../services/tickets.service';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './tickets.page.html',
  styleUrls: ['./tickets.page.css']
})
export class TicketsPage implements OnInit, OnDestroy {
  tickets: Ticket[] = [];
  private subscription!: Subscription;

  // Form
  ticketForm!: FormGroup;
  isModalOpen = false;

  // Catálogos
  habitacionesDisponibles: Habitacion[] = [
    { numero: '105', tipo: 'Standard Room' },
    { numero: '211', tipo: 'Ocean View' },
    { numero: '304', tipo: 'Suite' },
    { numero: '402', tipo: 'Junior Suite' }
  ];

  empleadoActual: Empleado = {
    id: 1,
    nombre: 'Alex Rivera',
    cargo: 'Maintenance Mgr'
  };

  constructor(
    private fb: FormBuilder,
    private ticketsService: TicketsService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.subscription = this.ticketsService.getTickets().subscribe(data => {
      this.tickets = data;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private initForm(): void {
    this.ticketForm = this.fb.group({
      habitacionNumero: ['', Validators.required],
      reportadoPor: [{ value: `${this.empleadoActual.nombre} (${this.empleadoActual.cargo})`, disabled: true }],
      descripcion: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  // Getters para estadísticas en tiempo real
  get pendientesCount(): number {
    return this.tickets.filter(t => t.estado === 'PENDIENTE').length;
  }

  get enProcesoCount(): number {
    return this.tickets.filter(t => t.estado === 'EN PROCESO').length;
  }

  get resueltosCount(): number {
    return this.tickets.filter(t => t.estado === 'RESUELTO').length;
  }

  get tmaPromedio(): string {
    return '42m';
  }

  toggleModal(): void {
    this.isModalOpen = !this.isModalOpen;
    if (this.isModalOpen) {
      this.ticketForm.reset({
        habitacionNumero: '',
        reportadoPor: `${this.empleadoActual.nombre} (${this.empleadoActual.cargo})`,
        descripcion: ''
      });
    }
  }

  onSubmit(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    const formVal = this.ticketForm.getRawValue();
    const habitacionSeleccionada = this.habitacionesDisponibles.find(
      h => h.numero === formVal.habitacionNumero
    );

    if (habitacionSeleccionada) {
      this.ticketsService.createTicket({
        habitacion: habitacionSeleccionada,
        descripcion: formVal.descripcion,
        reportadoPor: this.empleadoActual
      });
      this.toggleModal();
    }
  }

  setEnProceso(ticket: Ticket): void {
    this.ticketsService.updateEstado(ticket.id, 'EN PROCESO');
  }

  resolver(ticket: Ticket): void {
    this.ticketsService.updateEstado(ticket.id, 'RESUELTO');
  }

  verDetalle(ticket: Ticket): void {
    console.log('Detalle de ticket:', ticket);
  }
}
