import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LimpiezaService } from '../services/limpieza.service';
import { RegistroLimpieza } from '../models/registro-limpieza.model';
import { HabitacionesService } from '../../../recepcion/habitaciones/service/habitacion.service';
import { Habitacion } from '../../../../core/models/habitacion.model';

@Component({
    standalone: true,
    selector: 'app-limpieza-page',
    templateUrl: './limpieza.page.html',
    styleUrls: ['./limpieza.page.css'],
    imports: [CommonModule, FormsModule]
})
export class LimpiezaPage implements OnInit {

    habitaciones: Habitacion[] = [];
    habitacionSeleccionada: Habitacion | null = null;
    mensajeError: string = '';

    historial: RegistroLimpieza[] = [];
    notas: string = '';

    constructor(
        private limpiezaService: LimpiezaService,
        private habitacionesService: HabitacionesService
    ) { }

    ngOnInit(): void {
        this.cargarHabitaciones();
    }

    cargarHabitaciones() {
        this.habitacionesService.getAll()
            .subscribe(data => {
                this.habitaciones = data;
            });
    }

    seleccionarHabitacion(h: Habitacion) {
        this.habitacionSeleccionada = h;
        this.mensajeError = '';
        this.cargarHistorial(h.id);
    }

    get habitacionOcupada(): boolean {
        return (this.habitacionSeleccionada?.estado ?? '').trim().toUpperCase() === 'OCUPADA';
    }

    get puedeModificarLimpieza(): boolean {
        return !!this.habitacionSeleccionada && !this.habitacionOcupada;
    }

    cargarHistorial(id: number) {
        this.limpiezaService.getByHabitacion(id)
            .subscribe(res => {
                this.historial = res;
            });
    }

    get ultimaLimpieza(): RegistroLimpieza | null {
        if (!this.historial || this.historial.length === 0) return null;
        return [...this.historial].sort((a, b) => new Date(b.cambiadoEn).getTime() - new Date(a.cambiadoEn).getTime())[0] || null;
    }

    marcarLimpia() {
        if (!this.habitacionSeleccionada) return;
        if (this.habitacionOcupada) {
            console.error('[LimpiezaPage] No se puede modificar limpieza de una habitación ocupada');
            this.mensajeError = 'No se puede modificar limpieza de una habitación ocupada';
            return;
        }
        const habitacionId = this.habitacionSeleccionada.id;

        this.limpiezaService
            .registrarLimpieza(habitacionId, 'INSPECCIONADA', this.notas)
            .subscribe({
                next: () => {
                    if (this.habitacionSeleccionada) {
                        this.habitacionSeleccionada.estado = 'INSPECCIONADA';
                    }
                    this.notas = '';
                    this.mensajeError = '';
                    this.cargarHistorial(habitacionId);
                    this.cargarHabitaciones();
                },
                error: error => {
                    console.error('[LimpiezaPage] Error al marcar como limpia', error);
                    this.mensajeError = 'No se puede modificar limpieza de una habitación ocupada';
                }
            });
    }

    marcarSucia() {
        if (!this.habitacionSeleccionada) return;
        if (this.habitacionOcupada) {
            console.error('[LimpiezaPage] No se puede modificar limpieza de una habitación ocupada');
            this.mensajeError = 'No se puede modificar limpieza de una habitación ocupada';
            return;
        }
        const habitacionId = this.habitacionSeleccionada.id;

        this.limpiezaService
            .registrarLimpieza(habitacionId, 'SUCIA', this.notas)
            .subscribe({
                next: () => {
                    if (this.habitacionSeleccionada) {
                        this.habitacionSeleccionada.estado = 'SUCIA';
                    }
                    this.notas = '';
                    this.mensajeError = '';
                    this.cargarHistorial(habitacionId);
                    this.cargarHabitaciones();
                },
                error: error => {
                    console.error('[LimpiezaPage] Error al marcar como sucia', error);
                    this.mensajeError = 'No se puede modificar limpieza de una habitación ocupada';
                }
            });
    }
}