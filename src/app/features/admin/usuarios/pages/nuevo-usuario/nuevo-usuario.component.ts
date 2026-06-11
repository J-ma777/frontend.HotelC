import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { RolService } from '../../../../../core/services/rol.service';
import { Rol } from '../../../../../core/models/rol.model';

@Component({
  selector: 'app-nuevo-usuario',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './nuevo-usuario.component.html',
  styleUrls: ['./nuevo-usuario.component.css']
})
export class NuevoUsuarioComponent {
  roles: Rol[] = [];
  cargando = false;
  enviando = false;

  usuarioData = {
    nombreUsuario: '',
    correo: '',
    password: '',  // ← cambiado de contraseñaHash a password
    rolId: null as number | null
  };

  constructor(
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private router: Router
  ) {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.cargando = true;
    this.rolService.obtenerRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        alert('Error al cargar roles');
      }
    });
  }

  guardarUsuario(): void {
    // Validaciones
    if (!this.usuarioData.nombreUsuario.trim()) {
      alert('Ingrese el nombre de usuario');
      return;
    }
    if (!this.usuarioData.correo.trim()) {
      alert('Ingrese el correo electrónico');
      return;
    }
    if (!this.usuarioData.password.trim()) {  // ← cambiado
      alert('Ingrese la contraseña');
      return;
    }
    if (this.usuarioData.password.length < 6) {  // ← cambiado
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (!this.usuarioData.rolId) {
      alert('Seleccione un rol');
      return;
    }

    this.enviando = true;
    this.usuarioService.crearUsuario({
      nombreUsuario: this.usuarioData.nombreUsuario,
      correo: this.usuarioData.correo,
      contraseñaHash: this.usuarioData.password,  // ← mapeamos password a contraseñaHash
      rolId: this.usuarioData.rolId
    }).subscribe({
      next: () => {
        alert('Usuario creado correctamente');
        this.router.navigate(['/admin/usuarios']);
      },
      error: (err) => {
        this.enviando = false;
        console.error(err);
        alert('Error al crear usuario. El nombre de usuario o correo pueden estar duplicados.');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/admin/usuarios']);
  }
}