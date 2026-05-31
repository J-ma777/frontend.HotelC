import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nuevo-articulo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nuevo-articulo.component.html',
  styleUrls: ['./nuevo-articulo.component.css']
})
export class NuevoArticuloComponent {
  loading = false;
  successMessage = '';
  errorMessage = '';

  form: FormGroup;

  readonly unidades = ['UNIDAD', 'KG', 'LITRO', 'CAJA', 'PAQUETE'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(120)]],
      unidad: ['', [Validators.required]],
      stockMinimo: [0, [Validators.required, Validators.min(0)]],
      costoUnitario: [0, [Validators.required, Validators.min(0)]]
    });
  }

  guardarArticulo(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      nombre: this.form.value.nombre,
      unidad: this.form.value.unidad,
      stockMinimo: this.form.value.stockMinimo,
      costoUnitario: this.form.value.costoUnitario
    };

    this.loading = true;

    this.http.post('http://localhost:3030/inventario/articulos', payload)
      .subscribe({
        next: (res) => {
          console.log('Artículo creado correctamente', res);
          this.loading = false;
          this.successMessage = 'Artículo creado correctamente.';
          this.form.reset({
            nombre: '',
            unidad: '',
            stockMinimo: 0,
            costoUnitario: 0
          });

          setTimeout(() => {
            this.router.navigate(['/inventario'], {
              state: { successMessage: this.successMessage }
            });
          }, 900);
        },
        error: (err) => {
          console.error('Error al crear artículo', err);
          this.loading = false;
          this.errorMessage = 'Error al crear artículo.';
        }
      });
  }

  cancelar(): void {
    this.router.navigate(['/inventario']);
  }
}
