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
        this.cargarHistorial(h.id);
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
        const habitacionId = this.habitacionSeleccionada.id;

        this.limpiezaService
            .registrarLimpieza(habitacionId, 'INSPECCIONADA', this.notas)
            .subscribe(() => {
                if (this.habitacionSeleccionada) {
                    this.habitacionSeleccionada.estado = 'INSPECCIONADA';
                }
                this.notas = '';
                this.cargarHistorial(habitacionId);
                this.cargarHabitaciones();
            });
    }

    marcarSucia() {
        if (!this.habitacionSeleccionada) return;
        const habitacionId = this.habitacionSeleccionada.id;

        this.limpiezaService
            .registrarLimpieza(habitacionId, 'SUCIA', this.notas)
            .subscribe(() => {
                if (this.habitacionSeleccionada) {
                    this.habitacionSeleccionada.estado = 'SUCIA';
                }
                this.notas = '';
                this.cargarHistorial(habitacionId);
                this.cargarHabitaciones();
            });
    }
}