import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-mapa',
  standalone: true,
  templateUrl: './mapa.html',
  styleUrls: ['./mapa.css']
})
export class MapaComponent implements AfterViewInit {

  private map: any;

  ngAfterViewInit(): void {
    this.map = L.map('map').setView([4.6097, -74.0817], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    L.marker([4.6097, -74.0817])
      .addTo(this.map)
      .bindPopup('ServiClick')
      .openPopup();
  }
}