import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TipoCreate {
  nombre: string;
  capacidad: number;
  descripcion?: string;
  imagenUrl?: string;
}

@Component({
  selector: 'app-tipo-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tipo-form.component.html',
  styleUrls: ['./tipo-form.component.css']
})
export class TipoFormComponent {
  @Output() crearTipo = new EventEmitter<TipoCreate>();
  modelo: TipoCreate = {
    nombre: '',
    capacidad: 1,
    descripcion: '',
    imagenUrl: undefined
  };
  imagenUrl: string = '';

  onSubmit() {
    if (!this.modelo.nombre || !this.modelo.capacidad) return;
    const payload = { ...this.modelo, imagenUrl: this.imagenUrl || undefined };
    this.crearTipo.emit(payload);
    this.resetForm();
  }

  private resetForm() {
    this.modelo = { nombre: '', capacidad: 1, descripcion: '', imagenUrl: undefined };
    this.imagenUrl = '';
  }
}
