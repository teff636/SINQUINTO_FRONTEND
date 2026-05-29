import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, Notificacion } from '../../../core/services/auth.service';
import { NotificationUiService } from '../../../core/services/notification-ui.service';
import { AppTopbarComponent } from '../../../shared/app-topbar/app-topbar';
import { ClientQuickPanelComponent } from '../../../shared/client-quick-panel/client-quick-panel';

interface SolicitudCompletada {
  appointmentId: number;
  serviceOfferId: number;
  serviceTitle: string;
  sellerName: string;
  category: string;
  date: string;
  price: number;
  status: string;
  hasRating: boolean;
}

@Component({
  selector: 'app-historial-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, AppTopbarComponent, ClientQuickPanelComponent],
  templateUrl: './historial-cliente.html',
  styleUrls: ['./historial-cliente.css']
})
export class HistorialClienteComponent implements OnInit, OnDestroy {

  iniciales: string = 'CL';
  cargando: boolean = true;
  historial: SolicitudCompletada[] = [];

  mostrarModal: boolean = false;
  solicitudActual: SolicitudCompletada | null = null;
  calificacion: number = 0;
  comentario: string = '';
  mensajeExito: string = '';
  mensajeError: string = '';
  enviando: boolean = false;

  estrellas = [1, 2, 3, 4, 5];

  notifAbierta: boolean = false;

  get pendientesResena(): number { return this.notifService.count; }
  get itemsNotif(): Notificacion[] { return this.notifService.notificaciones; }

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly notifService: NotificationUiService
  ) {}

  ngOnInit(): void {
    this.cargarIniciales();
    this.cargarHistorial();
    const usuario = this.authService.getUsuarioLocal();
    if (usuario) this.notifService.iniciarPolling(usuario.userId);
  }

  ngOnDestroy(): void {
    this.notifService.detenerPolling();
  }

  private cargarIniciales(): void {
    const raw = localStorage.getItem('usuario');
    if (!raw) return;
    try {
      const u = JSON.parse(raw);
      this.iniciales = (u?.email || '').substring(0, 2).toUpperCase() || 'CL';
    } catch { this.iniciales = 'CL'; }
  }

  cargarHistorial(): void {
    const usuario = this.authService.getUsuarioLocal();
    if (!usuario) { this.router.navigate(['/login']); return; }
    this.authService.obtenerHistorialCliente(usuario.userId).subscribe({
      next: (data: any[]) => {
        this.historial = (data || []).filter((s: any) => s.status === 'COMPLETED');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.authService.obtenerSolicitudesCliente(usuario.userId).subscribe({
          next: (data2: any[]) => {
            this.historial = (data2 || []).filter((s: any) => s.status === 'COMPLETED');
            this.cargando = false;
            this.cdr.detectChanges();
          },
          error: () => { this.cargando = false; this.cdr.detectChanges(); }
        });
      }
    });
  }

  manejarNotificacion(n: Notificacion): void {
    this.notifService.marcarLeida(n, () => {
      if (n.type === 'APPOINTMENT_COMPLETED') {
        this.notifAbierta = false;
        if (n.appointmentId) {
          const item = this.historial.find(h => h.appointmentId === n.appointmentId);
          if (item && !item.hasRating) this.abrirModal(item);
        }
      } else if (n.type === 'APPOINTMENT_ACCEPTED' || n.type === 'APPOINTMENT_REJECTED') {
        this.notifAbierta = false;
        this.router.navigate(['/estado-cliente']);
      }
    });
  }

  marcarTodasLeidas(): void {
    const usuario = this.authService.getUsuarioLocal();
    if (usuario) this.notifService.marcarTodas(usuario.userId);
  }

  abrirModal(s: SolicitudCompletada): void {
    this.solicitudActual = s;
    this.calificacion = 0;
    this.comentario = '';
    this.mensajeExito = '';
    this.mensajeError = '';
    this.enviando = false;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.solicitudActual = null;
  }

  seleccionarEstrella(n: number): void { this.calificacion = n; }

  enviarResena(): void {
    if (this.calificacion === 0) {
      this.mensajeError = 'Selecciona una calificación de 1 a 5 estrellas.';
      return;
    }
    if (!this.solicitudActual) return;
    const usuario = this.authService.getUsuarioLocal();
    if (!usuario) return;

    this.enviando = true;
    this.mensajeError = '';

    const payload = {
      serviceOfferId: this.solicitudActual.serviceOfferId,
      userId: usuario.userId,
      appointmentId: this.solicitudActual.appointmentId,
      rating: this.calificacion,
      score: this.calificacion,
      comment: this.comentario
    };

    this.authService.crearCalificacion(payload).subscribe({
      next: () => {
        if (this.solicitudActual) {
          this.solicitudActual.hasRating = true;
          const item = this.historial.find(h => h.appointmentId === this.solicitudActual!.appointmentId);
          if (item) item.hasRating = true;
        }
        this.mensajeExito = '¡Reseña enviada correctamente!';
        this.enviando = false;
        this.cdr.detectChanges();
        setTimeout(() => this.cerrarModal(), 2000);
      },
      error: () => {
        this.mensajeError = 'Error al enviar la reseña. Intenta de nuevo.';
        this.enviando = false;
        this.cdr.detectChanges();
      }
    });
  }

  volverASolicitar(s: SolicitudCompletada): void {
    const servicioObj = {
      serviceOfferId: s.serviceOfferId,
      title: s.serviceTitle,
      vendedor: s.sellerName,
      category: s.category,
      price: s.price,
      photo: null,
      description: '',
      estimatedDuration: null
    };
    this.router.navigate(['/ver-servicio'], { state: { servicio: servicioObj } });
  }

  irInicio(): void { this.router.navigate(['/cliente']); }
  irGuardados(): void { this.router.navigate(['/guardados-cliente']); }
  irEstado(): void { this.router.navigate(['/estado-cliente']); }
  irHistorial(): void { this.router.navigate(['/historial-cliente']); }
  irPerfil(): void { this.router.navigate(['/perfil-cliente']); }

  toggleNotif(): void { this.notifAbierta = !this.notifAbierta; }
  cerrarNotif(): void { this.notifAbierta = false; }
}

