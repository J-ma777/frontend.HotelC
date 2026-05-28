import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Habitacion } from '../../../../core/models/habitacion.model';
import { HabitacionesService } from '../../../recepcion/habitaciones/service/habitacion.service';
import { Ticket, TicketEstado } from '../models/ticket.model';
import { TicketService } from '../services/ticket.service';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.page.css']
})
export class TicketsComponent implements OnInit, OnDestroy {
  tickets: Ticket[] = [];
  habitaciones: Habitacion[] = [];
  ticketForm: FormGroup;

  filtrosEstado: Array<'TODOS' | TicketEstado> = ['TODOS', 'ABIERTO', 'EN_PROCESO', 'RESUELTO'];
  filtroActual: 'TODOS' | TicketEstado = 'TODOS';

  isModalOpen = false;
  isLoadingTickets = false;
  isLoadingHabitaciones = false;
  isSavingTicket = false;
  ticketActionId: number | null = null;
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private habitacionesService: HabitacionesService
  ) {
    this.ticketForm = this.fb.group({
      habitacionId: [null as number | null, Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    this.subscription.add(
      this.ticketService.tickets$.subscribe(tickets => {
        this.tickets = this.enriquecerTickets(tickets);
      })
    );

    this.cargarTickets();
    this.cargarHabitaciones();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get pendientesCount(): number {
    return this.tickets.filter(t => t.estado === 'ABIERTO').length;
  }

  get enProcesoCount(): number {
    return this.tickets.filter(t => t.estado === 'EN_PROCESO').length;
  }

  get resueltosCount(): number {
    return this.tickets.filter(t => t.estado === 'RESUELTO').length;
  }

  get tmaPromedio(): string {
    return '42m';
  }

  get ticketsVisibles(): Ticket[] {
    if (this.filtroActual === 'TODOS') {
      return this.tickets;
    }

    return this.tickets.filter(ticket => ticket.estado === this.filtroActual);
  }

  setFiltro(filtro: 'TODOS' | TicketEstado): void {
    this.filtroActual = filtro;
  }

  cargarTickets(): void {
    this.isLoadingTickets = true;
    this.subscription.add(
      this.ticketService.getTickets().subscribe({
        next: () => {
          this.isLoadingTickets = false;
        },
        error: error => {
          console.log('[TicketsComponent] Error cargando tickets', error);
          this.isLoadingTickets = false;
        }
      })
    );
  }

  cargarHabitaciones(): void {
    this.isLoadingHabitaciones = true;
    this.subscription.add(
      this.habitacionesService.getDisponiblesMantenimiento().subscribe({
        next: habitaciones => {
          this.habitaciones = habitaciones;
          this.tickets = this.enriquecerTickets(this.tickets);
          this.isLoadingHabitaciones = false;
        },
        error: error => {
          console.log('[TicketsComponent] Error cargando habitaciones', error);
          this.isLoadingHabitaciones = false;
        }
      })
    );
  }

  abrirModal(): void {
    this.isModalOpen = true;
    this.ticketForm.reset({
      habitacionId: null,
      descripcion: ''
    });
  }

  cerrarModal(): void {
    this.isModalOpen = false;
    this.ticketForm.reset({
      habitacionId: null,
      descripcion: ''
    });
  }

  onSubmit(): void {
    if (this.ticketForm.invalid || this.isSavingTicket) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    const habitacionId = Number(this.ticketForm.get('habitacionId')?.value);
    const descripcion = this.ticketForm.value.descripcion?.trim() ?? '';

    if (!Number.isFinite(habitacionId) || habitacionId <= 0) {
      this.ticketForm.get('habitacionId')?.markAsTouched();
      return;
    }

    this.isSavingTicket = true;
    this.subscription.add(
      this.ticketService.createTicket({
        habitacionId,
        descripcion
      }).subscribe({
        next: ticketCreado => {
          console.log('[TicketsComponent] Ticket creado', ticketCreado);
          this.isSavingTicket = false;
          this.cerrarModal();
        },
        error: error => {
          console.log('[TicketsComponent] Error creando ticket', error);
          this.isSavingTicket = false;
        }
      })
    );
  }

  onHabitacionChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;
    this.ticketForm.get('habitacionId')?.setValue(value ? Number(value) : null);
    this.ticketForm.get('habitacionId')?.markAsDirty();
  }

  marcarEnProceso(ticket: Ticket): void {
    this.ticketActionId = ticket.id;
    this.subscription.add(
      this.ticketService.marcarEnProceso(ticket.id).subscribe({
        next: () => {
          this.ticketActionId = null;
        },
        error: error => {
          console.log('[TicketsComponent] Error marcando en proceso', error);
          this.ticketActionId = null;
        }
      })
    );
  }

  resolver(ticket: Ticket): void {
    this.ticketActionId = ticket.id;
    this.subscription.add(
      this.ticketService.resolver(ticket.id).subscribe({
        next: () => {
          this.ticketActionId = null;
        },
        error: error => {
          console.log('[TicketsComponent] Error resolviendo ticket', error);
          this.ticketActionId = null;
        }
      })
    );
  }

  getHabitacionPorId(habitacionId: number): Habitacion | undefined {
    return this.habitaciones.find(habitacion => habitacion.id === habitacionId);
  }

  trackByTicketId(_: number, ticket: Ticket): number {
    return ticket.id;
  }

  private enriquecerTickets(tickets: Ticket[]): Ticket[] {
    return tickets.map(ticket => {
      const habitacion = this.getHabitacionPorId(ticket.habitacionId);

      return {
        ...ticket,
        habitacionNumero: habitacion?.numero ?? ticket.habitacionNumero,
        habitacionTipo: habitacion?.tipoNombre ?? ticket.habitacionTipo
      };
    });
  }
}