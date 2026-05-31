import { Component, EventEmitter, Input, Output, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArticuloInventario } from '../../models/articulo-inventario.model';

@Component({
  selector: 'app-movimiento-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './movimiento-modal.component.html',
  styleUrls: ['./movimiento-modal.component.css']
})
export class MovimientoModalComponent implements OnInit, OnChanges {

  @Input() visible = false;
  @Input() articuloSeleccionado: ArticuloInventario | null = null;
  @Input() tipoInicial: 'ENTRADA' | 'SALIDA' | null = null;

  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<any>();

  form: FormGroup;
  tipo: 'ENTRADA' | 'SALIDA' | null = null;

  articulos: any[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      articuloId: [null, Validators.required],
      cantidad: [null, [Validators.required, Validators.min(1)]],
      motivo: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:3030/inventario/articulos')
      .subscribe(data => this.articulos = data);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['articuloSeleccionado']) {
      this.form.patchValue({
        articuloId: this.articuloSeleccionado?.id ?? null
      });
    }

    if (changes['tipoInicial'] && this.tipoInicial) {
      this.tipo = this.tipoInicial;
    }
  }

  seleccionarTipo(tipo: 'ENTRADA' | 'SALIDA') {
    this.tipo = tipo;
  }

  submit() {
    if (this.form.invalid || !this.tipo) return;

    const payload = {
      ...this.form.value,
      tipo: this.tipo
    };

    this.guardar.emit(payload);
  }

  close() {
    this.cerrar.emit();
    this.form.reset();
    this.tipo = null;
  }
}