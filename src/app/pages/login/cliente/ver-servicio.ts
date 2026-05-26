import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
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
    DecimalPipe,
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
  iniciales: string = 'CL';
  fechaSeleccionada: Date | null = null;
  horaSeleccionada: string | null = null;
  mostrarModal: boolean = false;
  nota: string = '';
  mensajeExito: string = '';
  mensajeError: string = '';
  minDate: Date = new Date();

  resenas: any[] = [];
  cargandoResenas: boolean = true;
  promedioCalificaciones: number = 0;

  pendientesResena: number = 0;
  notifAbierta: boolean = false;
  itemsNotif: any[] = [];

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
      return;
    }
    this.cargarIniciales();
    this.cargarResenas();
    this.cargarNotificaciones();
  }

  private cargarIniciales(): void {
    const raw = localStorage.getItem('usuario');
    if (!raw) { this.iniciales = 'CL'; return; }
    try {
      const u = JSON.parse(raw);
      this.iniciales = (u?.email || '').substring(0, 2).toUpperCase() || 'CL';
    } catch { this.iniciales = 'CL'; }
  }

  private cargarResenas(): void {
    if (!this.servicio?.serviceOfferId) { this.cargandoResenas = false; return; }
    this.authService.getCalificacionesPorServicio(this.servicio.serviceOfferId).subscribe({
      next: (data: any) => {
        const arr = Array.isArray(data) ? data : (data?.ratings || data?.content || []);
        this.resenas = arr;
        if (arr.length > 0) {
          this.promedioCalificaciones = arr.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / arr.length;
        }
        this.cargandoResenas = false;
        this.cdr.detectChanges();
      },
      error: () => { this.cargandoResenas = false; this.cdr.detectChanges(); }
    });
  }

  getEstrellas(rating: number): string {
    const n = Math.round(rating || 0);
    return '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n));
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
      status: 'PENDING'
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

  irInicio(): void { this.router.navigate(['/cliente']); }
  irPerfil(): void { this.router.navigate(['/perfil-cliente']); }
  volver() { this.router.navigate(['/cliente']); }

  private cargarNotificaciones(): void {
    const usuario = this.authService.getUsuarioLocal();
    if (!usuario) return;
    this.authService.cargarNotificacionesCliente(usuario.userId).subscribe({
      next: (items: any[]) => {
        this.itemsNotif = items;
        this.pendientesResena = items.length;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  marcarLeida(notif: any): void {
    const usuario = this.authService.getUsuarioLocal();
    if (!usuario) return;
    this.authService.marcarNotificacionLeida(usuario.userId, notif.key);
    this.itemsNotif = this.itemsNotif.filter(n => n.key !== notif.key);
    this.pendientesResena = this.itemsNotif.length;
    this.cdr.detectChanges();
  }

  toggleNotif(): void { this.notifAbierta = !this.notifAbierta; }
  cerrarNotif(): void { this.notifAbierta = false; }
  irAResena(): void { this.notifAbierta = false; this.router.navigate(['/historial-cliente']); }
}