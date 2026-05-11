import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-ver-servicio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './ver-servicio.html',
  styleUrls: ['./ver-servicio.css']
})
export class VerServicioComponent implements OnInit {

  servicio: any = null;
  fechaSeleccionada: Date | null = null;
  horaSeleccionada: string | null = null;
  mostrarModal: boolean = false;
  nota: string = '';
  mensajeExito: string = '';
  mensajeError: string = '';
  minDate: Date = new Date();

  horas = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    const nav = this.router.getCurrentNavigation();
    this.servicio = nav?.extras?.state?.['servicio'] || null;
  }

  ngOnInit() {
    if (!this.servicio) {
      this.router.navigate(['/cliente']);
    }
  }

  seleccionarHora(hora: string) { this.horaSeleccionada = hora; }

  abrirModal() {
    if (!this.fechaSeleccionada || !this.horaSeleccionada) {
      this.mensajeError = 'Selecciona una fecha y hora';
      return;
    }
    this.mensajeError = '';
    this.mostrarModal = true;
  }

  cancelarModal() {
    this.mostrarModal = false;
    this.nota = '';
  }

  confirmarSolicitud() {
    const usuario = this.authService.getUsuarioLocal();
    if (!usuario) {
      this.router.navigate(['/login']);
      return;
    }

    const cita = {
      userId: usuario.userId,
      serviceOfferId: this.servicio.serviceOfferId,
      date: this.fechaSeleccionada?.toISOString(),
    };

    this.authService.crearCita(cita).subscribe({
      next: () => {
        this.mostrarModal = false;
        this.mensajeExito = '¡Solicitud enviada correctamente!';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/estado-cliente']);
        }, 2000);
      },
      error: (err) => {
        console.log(err);
        this.mensajeError = 'Error al enviar la solicitud';
        this.cdr.detectChanges();
      }
    });
  }

  volver() { this.router.navigate(['/cliente']); }
}