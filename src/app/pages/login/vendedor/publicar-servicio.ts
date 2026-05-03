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

  categorias = ['Tecnología', 'Diseño', 'Hogar', 'Clases', 'Legal', 'Otro'];

  constructor(private router: Router) {} 

  seleccionarCategoria(cat: string) {
    this.categoriaSeleccionada = cat;
  }


  formatearPrecio() {
    let limpio = this.precio.replace(/\D/g, '');
    this.precio = new Intl.NumberFormat('es-CO').format(Number(limpio));
  }


  onFileSelected(event: any) {
    const files = event.target.files;
    console.log(files);
  }

  publicar() {
    console.log({
      descripcion: this.descripcion,
      categoria: this.categoriaSeleccionada,
      precio: this.precio,
      tipo: this.tipoCobro
    });

    this.mostrarModal = true;
  }

  publicarOtro() {
    this.mostrarModal = false;
    this.descripcion = '';
    this.precio = '';
  }

 
  irInicio() {
    this.router.navigate(['/vendedor']); 
  }

}