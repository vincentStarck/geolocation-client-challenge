import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
   url = '/api';
  constructor(private http: HttpClient) { }

  getAllVehicles(): Observable<any> {
    return this.http.get(this.url);
  }
}
