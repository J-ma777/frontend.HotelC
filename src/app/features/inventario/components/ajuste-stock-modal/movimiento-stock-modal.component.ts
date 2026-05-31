import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArticuloInventario } from '../../models/articulo-inventario.model';

@Component({
  selector: 'app-ajuste-stock-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './movimiento-stock-modal.component.html',
  styleUrls: ['./movimiento-stock-modal.component.css']
})
export class AjusteStockModalComponent {

  @Input() visible = false;
  @Input() articulo: ArticuloInventario | null = null;

  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<any>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nuevoStock: [null, [Validators.required, Validators.min(0)]],
      motivo: ['', Validators.required]
    });
  }

  get diferencia(): number | null {
    if (!this.articulo || this.form.value.nuevoStock == null) return null;
    return this.form.value.nuevoStock - this.articulo.stockActual;
  }

  submit() {
    if (this.form.invalid || !this.articulo) return;

    const payload = {
      articuloId: this.articulo.id,
      nuevoStock: this.form.value.nuevoStock,
      motivo: this.form.value.motivo
    };

    this.guardar.emit(payload);
  }

  close() {
    this.form.reset();
    this.cerrar.emit();
  }
}
