import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm: FormGroup;
  mostrarPassword = false;
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando = true;


    const payload = {
      username: this.loginForm.value.nombreUsuario,
      password: this.loginForm.value.contrasena
    };

    this.authService.login(payload).subscribe({
      next: (response) => {
        this.authService.setSession(response);
        console.log('[LoginComponent] localStorage.user raw:', localStorage.getItem('user'));
        console.log('[LoginComponent] localStorage.accessToken exists:', !!localStorage.getItem('accessToken'));
        console.log('[LoginComponent] permisos via service:', this.authService.getPermisos());
        this.cargando = false;
        
        // Redirección al Dashboard
        this.router.navigate(['/admin']);
      },
      error: () => {
        this.cargando = false;
        alert('Credenciales incorrectas ❌');
      }
    });
  }
}