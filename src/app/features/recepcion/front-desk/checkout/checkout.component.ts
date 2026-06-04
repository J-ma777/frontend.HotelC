import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReservasService } from '../../reservas/services/reservas.service';
import { ReservaCheckout } from '../models/reserva-checkout.model';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

    reservas: ReservaCheckout[] = [];
    loading = true;

    constructor(
        private reservasService: ReservasService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.cargarReservas();
    }

    cargarReservas() {
        this.reservasService.obtenerReservasCheckout().subscribe({
            next: (data) => {
                this.reservas = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error cargando checkout', err);
                this.loading = false;
            }
        });
    }

    abrirFolio(reserva: ReservaCheckout) {
        this.router.navigate(
            ['/recepcion/reservas', reserva.id, 'folio'],
            { queryParams: { fromCheckout: true } }
        );
    }
}