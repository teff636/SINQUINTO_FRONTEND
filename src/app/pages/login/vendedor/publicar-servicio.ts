import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-publicar-servicio',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './publicar-servicio.html',
  styleUrls: ['./publicar-servicio.css']
})
export class PublicarServicioComponent {

  descripcion = '';
  precio = '';
  categoriaSeleccionada = 'Tecnología';
  tipoCobro = 'sesion';

  mostrarModal = false;

  imagenBase64: string = '';

  categorias = [
    'Tecnología',
    'Diseño',
    'Hogar',
    'Clases',
    'Legal',
    'Otro'
  ];

  constructor(private router: Router) {}

  seleccionarCategoria(cat: string) {
    this.categoriaSeleccionada = cat;
  }

  formatearPrecio() {
    let limpio = this.precio.replace(/\D/g, '');
    this.precio = new Intl.NumberFormat('es-CO').format(Number(limpio));
  }

  /* GUARDAR IMAGEN */
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

    const nuevoServicio = {

      id: Date.now(),

      imagen: this.imagenBase64,

      nombre: this.descripcion,

      categoria: this.categoriaSeleccionada,

      precio: this.precio,

      estado: 'Activo'
    };

    /* OBTENER SERVICIOS */
    const serviciosGuardados =
      JSON.parse(localStorage.getItem('servicios') || '[]');

    /* AGREGAR NUEVO */
    serviciosGuardados.push(nuevoServicio);

    /* GUARDAR */
    localStorage.setItem(
      'servicios',
      JSON.stringify(serviciosGuardados)
    );

    console.log('Servicio guardado');

    this.mostrarModal = true;
  }

  publicarOtro() {

    this.mostrarModal = false;

    this.descripcion = '';
    this.precio = '';
    this.imagenBase64 = '';
  }

  irInicio() {
    this.router.navigate(['/vendedor']);
  }

}