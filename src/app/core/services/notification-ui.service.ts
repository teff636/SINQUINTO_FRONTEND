import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService, Notificacion } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationUiService implements OnDestroy {

  private readonly _notifs = new BehaviorSubject<Notificacion[]>([]);
  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly authService: AuthService) {}

  ngOnDestroy(): void {
    this.detenerPolling();
  }

  iniciarPolling(userId: number): void {
    this.cargar(userId);
    this.detenerPolling();
    this.pollingInterval = setInterval(() => this.cargar(userId), 15000);
  }

  detenerPolling(): void {
    if (this.pollingInterval !== null) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  cargar(userId: number): void {
    this.authService.getNotificacionesNoLeidas(userId).subscribe({
      next: items => this._notifs.next(items),
      error: () => {}
    });
  }

  marcarLeida(n: Notificacion, onDespues?: () => void): void {
    this.authService.marcarNotificacionLeida(n.id).subscribe({
      next: () => {
        this._notifs.next(this._notifs.value.filter(x => x.id !== n.id));
        if (onDespues) onDespues();
      },
      error: () => {
        this._notifs.next(this._notifs.value.filter(x => x.id !== n.id));
      }
    });
  }

  marcarTodas(userId: number): void {
    this.authService.marcarTodasNotificacionesLeidas(userId).subscribe({
      next: () => this._notifs.next([]),
      error: () => {}
    });
  }

  get notificaciones(): Notificacion[] {
    return this._notifs.value;
  }

  get count(): number {
    return this._notifs.value.length;
  }
}
