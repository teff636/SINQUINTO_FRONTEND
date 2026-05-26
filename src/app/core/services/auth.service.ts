import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}


  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }


  getUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  getUsuarioPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${id}`);
  }

  actualizarUsuario(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users`, data);
  }


  getServicios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/service-offers`);
  }

  getServiciosPorVendedor(sellerId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/service-offers/seller/${sellerId}`);
  }

  crearServicio(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/service-offers`, data);
  }

  actualizarServicio(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/service-offers/${id}`, data);
  }
  
  getCitasPorServicio(serviceOfferId: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/appointments/service-offer/${serviceOfferId}`);
}

  eliminarServicio(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/service-offers/${id}`);
  }

 
  getCategorias(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories`);
  }


  getCitasPorUsuario(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/appointments/user/${userId}`);
  }

  crearCita(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments`, data);
  }

  actualizarCita(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/appointments/${id}`, data);
  }


  getCalificacionesPorServicio(serviceOfferId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/ratings/service-offer/${serviceOfferId}`);
  }

  crearCalificacion(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ratings`, data);
  }


  obtenerSolicitudesCliente(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/appointments/user/${userId}/details`);
  }

  obtenerHistorialCliente(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/appointments/user/${userId}/historial`);
  }

  obtenerSolicitudesVendedor(sellerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/appointments/seller/${sellerId}`);
  }

  actualizarEstadoSolicitud(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/appointments/${id}/status`, { status });
  }

  loginConGoogle(idToken: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.apiUrl}/auth/google-login`, { idToken }, { observe: 'response' });
  }

  registrarConGoogle(data: { idToken: string; role: string; name: string; lastName: string; phoneNumber: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/google-register`, data);
  }

  guardarGooglePendiente(data: { idToken: string; email: string; name: string; lastName: string }): void {
    sessionStorage.setItem('googlePendiente', JSON.stringify(data));
  }

  getGooglePendiente(): any {
    const d = sessionStorage.getItem('googlePendiente');
    return d ? JSON.parse(d) : null;
  }

  limpiarGooglePendiente(): void {
    sessionStorage.removeItem('googlePendiente');
  }

  guardarSesion(res: any): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('usuario', JSON.stringify(res));
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  getUsuarioLocal(): any {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  cargarNotificacionesCliente(userId: number): Observable<any[]> {
    const leidasKey = `notif_leidas_${userId}`;
    const leidas: string[] = JSON.parse(localStorage.getItem(leidasKey) || '[]');

    const activas$ = this.obtenerSolicitudesCliente(userId).pipe(catchError(() => of([])));
    const historial$ = this.obtenerHistorialCliente(userId).pipe(catchError(() => of([])));

    return forkJoin([activas$, historial$]).pipe(
      map(([activas, historial]: [any[], any[]]) => {
        const notifsActivas = (activas || [])
          .filter((s: any) => s.status === 'ACCEPTED' || s.status === 'REJECTED')
          .filter((s: any) => !leidas.includes(`${s.appointmentId}_${s.status}`))
          .map((s: any) => ({
            appointmentId: s.appointmentId,
            serviceTitle: s.serviceTitle,
            sellerName: s.sellerName,
            tipo: s.status,
            key: `${s.appointmentId}_${s.status}`
          }));

        const notifsResena = (historial || [])
          .filter((s: any) => s.status === 'COMPLETED' && s.hasRating === false)
          .map((s: any) => ({
            appointmentId: s.appointmentId,
            serviceTitle: s.serviceTitle,
            sellerName: s.sellerName,
            tipo: 'RESENA',
            key: `${s.appointmentId}_RESENA`
          }));

        return [...notifsActivas, ...notifsResena];
      })
    );
  }

  marcarNotificacionLeida(userId: number, key: string): void {
    const leidasKey = `notif_leidas_${userId}`;
    const leidas: string[] = JSON.parse(localStorage.getItem(leidasKey) || '[]');
    if (!leidas.includes(key)) {
      leidas.push(key);
      localStorage.setItem(leidasKey, JSON.stringify(leidas));
    }
  }
}