import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Notificacion {
  id: number;
  userId: number;
  type: 'APPOINTMENT_REQUESTED' | 'APPOINTMENT_ACCEPTED' | 'APPOINTMENT_REJECTED' | 'APPOINTMENT_COMPLETED';
  title: string;
  message: string;
  read: boolean;
  appointmentId?: number;
  serviceOfferId?: number;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private readonly http: HttpClient) {}


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

  // Notificaciones reales del backend

  getNotificacionesUsuario(userId: number): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.apiUrl}/notifications/user/${userId}`);
  }

  getNotificacionesNoLeidas(userId: number): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.apiUrl}/notifications/user/${userId}/unread`);
  }

  marcarNotificacionLeida(notificationId: number): Observable<Notificacion> {
    return this.http.patch<Notificacion>(`${this.apiUrl}/notifications/${notificationId}/read`, {});
  }

  marcarTodasNotificacionesLeidas(userId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/notifications/user/${userId}/read-all`, {});
  }
}
