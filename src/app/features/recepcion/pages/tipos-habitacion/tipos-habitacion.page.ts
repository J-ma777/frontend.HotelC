import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TipoHabitacionService } from '../../../../core/services/tipo-habitacion.service';
import { TipoHabitacion } from '../../../../core/models/tipo-habitacion.model';
import { TipoFormComponent } from './componentes/tipo-form/tipo-form.component';
import { TipoCardComponent } from './componentes/tipo-card/tipo-card.component';

@Component({
	selector: 'app-tipos-habitacion',
	standalone: true,
	imports: [CommonModule, TipoFormComponent, TipoCardComponent],
	templateUrl: './tipos-habitacion.page.html',
	styleUrls: ['./tipos-habitacion.page.css']
})
export class TiposHabitacionPage implements OnInit {
	tipos: TipoHabitacion[] = [];
	message: string | null = null;
	messageType: 'success' | 'error' | null = null;

	constructor(private tipoService: TipoHabitacionService) {}

	ngOnInit(): void {
		this.loadAll();
	}

	loadAll(): void {
		this.tipoService.getAll().subscribe({ next: (data: TipoHabitacion[]) => this.tipos = data, error: (err: unknown) => console.error(err) });
	}

	handleCrear(tipo: { nombre: string; capacidad: number; descripcion?: string; imagenUrl?: string }): void {
		const payload = { nombre: tipo.nombre, capacidad: tipo.capacidad, descripcion: tipo.descripcion ?? '', imagenUrl: tipo.imagenUrl };
		this.tipoService.create(payload).subscribe({ next: () => {
			this.loadAll();
			this.showMessage('Categoría guardada correctamente', 'success');
		}, error: (err: unknown) => {
			console.error(err);
			this.showMessage('Error al guardar la categoría', 'error');
		} });
	}

	private showMessage(text: string, type: 'success' | 'error'): void {
		this.message = text;
		this.messageType = type;
		setTimeout(() => { this.message = null; this.messageType = null; }, 4000);
	}
}
