import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}