import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { RolService } from '../../../../../core/services/rol.service';
import { Usuario } from '../../../../../core/models/usuario.model';
import { Rol } from '../../../../../core/models/rol.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './lista-usuarios.component.html',
  styleUrls: ['./lista-usuarios.component.css']
})
export class ListaUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  usuarioSeleccionado: Usuario | null = null;
  rolSeleccionadoId: number | null = null;
  mostrarModal = false;
  cargando = false;

  constructor(
    private usuarioService: UsuarioService,
    private rolService: RolService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        alert('Error al cargar usuarios');
      }
    });
  }

  cargarRoles(): void {
    this.rolService.obtenerRoles().subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: () => {
        alert('Error al cargar roles');
      }
    });
  }

  abrirModalAsignarRol(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
    this.rolSeleccionadoId = usuario.rol?.id || null;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.usuarioSeleccionado = null;
    this.rolSeleccionadoId = null;
  }

  asignarRol(): void {
    if (!this.usuarioSeleccionado || !this.rolSeleccionadoId) {
      alert('Seleccione un rol');
      return;
    }

    this.usuarioService.asignarRol(this.usuarioSeleccionado.id, this.rolSeleccionadoId).subscribe({
      next: () => {
        alert('Rol asignado correctamente');
        this.cargarUsuarios();
        this.cerrarModal();
      },
      error: () => {
        alert('Error al asignar rol');
      }
    });
  }

  // Getter para usuarios activos
  get usuariosActivos(): number {
    return this.usuarios.filter(u => u.estado).length;
  }
}