import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-publicar-servicio',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './publicar-servicio.html',
  styleUrls: ['./publicar-servicio.css']
})
export class PublicarServicioComponent {

  // Emite evento al componente padre cuando se publica
  @Output() servicioPublicado = new EventEmitter<void>();

  titulo = '';
  descripcion = '';
  precio = '';
  duracionEstimada = 60;
  categoriaSeleccionada = 'Tecnología';
  tipoCobro = 'sesion';
  mostrarModal = false;
  imagenBase64: string = '';
  mensajeError = '';

  categorias = [
    'Tecnología',
    'Diseño',
    'Hogar',
    'Clases',
    'Legal',
    'Otro'
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  seleccionarCategoria(cat: string) {
    this.categoriaSeleccionada = cat;
  }

  formatearPrecio() {
    let limpio = this.precio.replace(/\D/g, '');
    this.precio = new Intl.NumberFormat('es-CO').format(Number(limpio));
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  publicar() {
    this.mensajeError = '';

    const usuario = this.authService.getUsuarioLocal();
    if (!usuario) {
      this.mensajeError = 'No hay sesión activa';
      return;
    }

    // Validar campos obligatorios
    if (!this.titulo.trim()) {
      this.mensajeError = 'El título es obligatorio';
      return;
    }
    if (!this.descripcion.trim()) {
      this.mensajeError = 'La descripción es obligatoria';
      return;
    }
    if (!this.precio) {
      this.mensajeError = 'El precio es obligatorio';
      return;
    }

    const precioLimpio = parseFloat(this.precio.replace(/\./g, '').replace(',', '.'));

    const nuevoServicio = {
      sellerId: usuario.userId,
      title: this.titulo,
      description: this.descripcion,
      price: precioLimpio,
      estimatedDuration: this.duracionEstimada,
      category: this.categoriaSeleccionada,
      photo: this.imagenBase64
    };

    this.authService.crearServicio(nuevoServicio).subscribe({
      next: () => {
        console.log('Servicio guardado en BD');
        this.mostrarModal = true;
        // Avisar al componente padre que se publicó un servicio nuevo
        this.servicioPublicado.emit();
      },
      error: (err) => {
        console.log(err);
        this.mensajeError = 'Error al publicar el servicio';
      }
    });
  }


  publicarOtro() {
    this.mostrarModal = false;
    this.titulo = '';
    this.descripcion = '';
    this.precio = '';
    this.imagenBase64 = '';
    this.mensajeError = '';
  }

@Output() cerrar = new EventEmitter<void>();

irInicio() {
  this.cerrar.emit();
}
}