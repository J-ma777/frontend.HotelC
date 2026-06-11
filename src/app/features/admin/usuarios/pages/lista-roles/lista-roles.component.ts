import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RolService } from '../../../../../core/services/rol.service';
import { PermisoService } from '../../../../../core/services/permiso.service';
import { Rol } from '../../../../../core/models/rol.model';
import { Permiso } from '../../../../../core/models/permiso.model';

@Component({
  selector: 'app-lista-roles',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './lista-roles.component.html',
  styleUrls: ['./lista-roles.component.css']
})
export class ListaRolesComponent implements OnInit {
  roles: Rol[] = [];
  permisos: Permiso[] = [];
  cargando = false;
  
  // Modal permisos
  mostrarModalPermisos = false;
  rolSeleccionado: Rol | null = null;
  permisosSeleccionados: number[] = [];
  filtroPermisos = '';

  // Modal nuevo rol
  mostrarModalNuevoRol = false;
  nuevoRol = {
    nombre: '',
    descripcion: ''
  };
  creando = false;

  constructor(
    private rolService: RolService,
    private permisoService: PermisoService
  ) {}

  ngOnInit(): void {
    this.cargarRoles();
    this.cargarPermisos();
  }

  get totalPermisosAsignados(): number {
    return this.roles.reduce((total, rol) => total + (rol.permisos?.length || 0), 0);
  }

  // Permisos filtrados por búsqueda
  get permisosFiltrados(): Permiso[] {
    if (!this.filtroPermisos) return this.permisos;
    const filtro = this.filtroPermisos.toLowerCase();
    return this.permisos.filter(p => 
      p.nombre.toLowerCase().includes(filtro) ||
      p.recurso.toLowerCase().includes(filtro) ||
      p.accion.toLowerCase().includes(filtro)
    );
  }

  // Permisos agrupados por recurso
  get permisosAgrupados(): { recurso: string; permisos: Permiso[] }[] {
    const grupos = new Map<string, Permiso[]>();
    
    (this.filtroPermisos ? this.permisosFiltrados : this.permisos).forEach(permiso => {
      const recurso = permiso.recurso || 'OTROS';
      if (!grupos.has(recurso)) {
        grupos.set(recurso, []);
      }
      grupos.get(recurso)!.push(permiso);
    });
    
    // Ordenar grupos por nombre
    return Array.from(grupos.entries())
      .map(([recurso, permisos]) => ({ recurso, permisos }))
      .sort((a, b) => a.recurso.localeCompare(b.recurso));
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

  cargarPermisos(): void {
    this.permisoService.obtenerPermisos().subscribe({
      next: (data) => {
        this.permisos = data;
      },
      error: () => {
        alert('Error al cargar permisos');
      }
    });
  }

  abrirModalPermisos(rol: Rol): void {
    this.rolSeleccionado = rol;
    this.permisosSeleccionados = rol.permisos?.map(p => p.id) || [];
    this.filtroPermisos = '';
    this.mostrarModalPermisos = true;
  }

  cerrarModalPermisos(): void {
    this.mostrarModalPermisos = false;
    this.rolSeleccionado = null;
    this.permisosSeleccionados = [];
    this.filtroPermisos = '';
  }

  togglePermiso(permisoId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.permisosSeleccionados.push(permisoId);
    } else {
      this.permisosSeleccionados = this.permisosSeleccionados.filter(id => id !== permisoId);
    }
  }

  estaSeleccionado(permisoId: number): boolean {
    return this.permisosSeleccionados.includes(permisoId);
  }

  seleccionarTodos(): void {
    const permisosActuales = this.filtroPermisos ? this.permisosFiltrados : this.permisos;
    this.permisosSeleccionados = [...new Set([...this.permisosSeleccionados, ...permisosActuales.map(p => p.id)])];
  }

  deseleccionarTodos(): void {
    const permisosActuales = this.filtroPermisos ? this.permisosFiltrados : this.permisos;
    this.permisosSeleccionados = this.permisosSeleccionados.filter(id => 
      !permisosActuales.some(p => p.id === id)
    );
  }

  guardarPermisos(): void {
    if (!this.rolSeleccionado) return;

    this.rolService.asignarPermisos(this.rolSeleccionado.id, this.permisosSeleccionados).subscribe({
      next: () => {
        alert('Permisos asignados correctamente');
        this.cargarRoles();
        this.cerrarModalPermisos();
      },
      error: () => {
        alert('Error al asignar permisos');
      }
    });
  }

  // Modal nuevo rol
  abrirModalNuevoRol(): void {
    this.nuevoRol = { nombre: '', descripcion: '' };
    this.mostrarModalNuevoRol = true;
  }

  cerrarModalNuevoRol(): void {
    this.mostrarModalNuevoRol = false;
    this.nuevoRol = { nombre: '', descripcion: '' };
  }

  crearRol(): void {
    if (!this.nuevoRol.nombre.trim()) {
      alert('Ingrese el nombre del rol');
      return;
    }

    this.creando = true;
    this.rolService.crearRol(this.nuevoRol).subscribe({
      next: () => {
        alert('Rol creado correctamente');
        this.cerrarModalNuevoRol();
        this.cargarRoles();
        this.creando = false;
      },
      error: (err) => {
        this.creando = false;
        console.error(err);
        alert('Error al crear el rol');
      }
    });
  }
}