import { Component, OnInit } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { Vehicle } from './model/Vehicle';
import { VehicleService } from './vehicle.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private serverUrl = 'http://localhost:8080/vehicles-geolocations';
  private title = 'Ubicación en tiempo real de vehiculos';
  private stompClient;

  public vehicles: Vehicle[];


  constructor(private vehicleService: VehicleService) {
    this.vehicles = new Array();
  }
  ngOnInit() {

  }

  checkBoxChangeEvent(event: any) {
    (event.srcElement.checked) ? this.connectSocket() : this.disconnectSocket();

  }
  disconnectSocket() {
    this.vehicles = new Array();
    if (this.stompClient !== null) {
      this.stompClient.disconnect();
    }
    console.log('WebSocket disconnected');

  }


  connectSocket() {
    this.getAllVehicles();

    const ws = new SockJS(this.serverUrl);
    this.stompClient = Stomp.over(ws);
    const self = this;
    this.stompClient.connect({}, function (frame) {
      self.stompClient.subscribe('/topic/vehicles', (message) => {

        if (!message.body) {

          console.error('body without content');
          return;
        }

        const jsonBody = JSON.parse(message.body);
        const vehicleToUpdate = self.vehicles.find(function (element) {

          return element.placa === jsonBody.placa;

        });

        if (vehicleToUpdate) {
          // update coordiantes of vehicle existent
          vehicleToUpdate.coordinates = jsonBody.geolocation.coordinates;
        } else {
          // add a new vehicle to the vehicle's list
          self.vehicles.push({ placa: jsonBody.placa, coordinates: (jsonBody.geolocation) ? jsonBody.geolocation.coordinates : [] });

        }

      }
      );
    });
  }

  getAllVehicles() {

    this.vehicleService.getAllVehicles().subscribe(data => {

      if (data.vehicles) {
        data.vehicles.forEach(element => {
          console.log(element);
          this.vehicles.push({ placa: element.placa, coordinates: (element.geolocation) ? element.geolocation.coordinates : [] });
        });
      }

    });
  }

}
