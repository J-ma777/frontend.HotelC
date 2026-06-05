import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LimpiezaService } from '../services/limpieza.service';
import { RegistroLimpieza } from '../models/registro-limpieza.model';
import { HabitacionesService } from '../../../recepcion/habitaciones/service/habitacion.service';
import { Habitacion } from '../../../../core/models/habitacion.model';
import { HabitacionMapa } from 'app/features/recepcion/front-desk/models/habitacion-mapa.model';

@Component({
    standalone: true,
    selector: 'app-limpieza-page',
    templateUrl: './limpieza.page.html',
    styleUrls: ['./limpieza.page.css'],
    imports: [CommonModule, FormsModule]
})
export class LimpiezaPage implements OnInit {

    habitaciones: HabitacionMapa[] = [];
    habitacionSeleccionada: HabitacionMapa | null = null;
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
        this.habitacionesService.getMapa()
            .subscribe(data => {
                this.habitaciones = data;
            });
    }

    seleccionarHabitacion(h: HabitacionMapa) {
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

    cambiarEstado(nuevoEstado: string) {
        if (!this.habitacionSeleccionada) return;
    
        if (this.habitacionOcupada) {
            this.mensajeError = 'No se puede modificar una habitación ocupada';
            return;
        }
    
        const habitacionId = this.habitacionSeleccionada.id;
    
        this.habitacionesService
            .cambiarEstadoHabitacion(habitacionId, nuevoEstado)
            .subscribe({
                next: () => {
                    // actualizar estado local (clave para UI)
                    if (this.habitacionSeleccionada) {
                        this.habitacionSeleccionada.estado = nuevoEstado;
                    }
    
                    this.notas = '';
                    this.mensajeError = '';
    
                    this.cargarHistorial(habitacionId);
                    this.cargarHabitaciones();
                },
                error: err => {
                    console.error('[LimpiezaPage] Error al cambiar estado', err);
                    this.mensajeError = 'No se pudo cambiar el estado';
                }
            });
    }

    esSucia(): boolean {
        return this.habitacionSeleccionada?.estado === 'SUCIA';
    }
    
    esLimpiando(): boolean {
        return this.habitacionSeleccionada?.estado === 'LIMPIANDO';
    }
    
    esInspeccionada(): boolean {
        return this.habitacionSeleccionada?.estado === 'INSPECCIONADA';
    }
}