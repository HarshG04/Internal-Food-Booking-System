import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Floor, Restaurant } from '../models/restaurant.model';
import { FloorAssignment, FloorAssignRequest } from '../models/revenue.model';
import { User } from '../models/user.model';
import { Order } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ManagerService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── FLOOR ──────────────────────────────────────────────
  // GET /floor/getAll
  getAllFloors(): Observable<Floor[]> {
    return this.http.get<Floor[]>(`${this.baseUrl}/floor/getAll`, { withCredentials: true });
  }
  // GET /floor/getActive
  getActiveFloors(): Observable<Floor[]> {
    return this.http.get<Floor[]>(`${this.baseUrl}/floor/getActive`, { withCredentials: true });
  }
  // POST /floor/create
  createFloor(floor: Partial<Floor>): Observable<Floor> {
    return this.http.post<Floor>(`${this.baseUrl}/floor/create`, floor, { withCredentials: true });
  }
  // PUT /floor/update/{id}
  updateFloor(id: number, floor: Partial<Floor>): Observable<Floor> {
    return this.http.put<Floor>(`${this.baseUrl}/floor/update/${id}`, floor, { withCredentials: true });
  }
  // DELETE /floor/delete/{id}
  deleteFloor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/floor/delete/${id}`, { withCredentials: true });
  }

  // ── SHOP ───────────────────────────────────────────────
  // GET /shop/getAll
  getAllShops(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUrl}/shop/getAll`, { withCredentials: true });
  }
  // GET /shop/getByFloor/{floorId}
  getShopsByFloor(floorId: number): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUrl}/shop/getByFloor/${floorId}`, { withCredentials: true });
  }
  // POST /shop/create
  createShop(shop: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.post<Restaurant>(`${this.baseUrl}/shop/create`, shop, { withCredentials: true });
  }
  // PUT /shop/update/{id}
  updateShop(id: number, shop: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.baseUrl}/shop/update/${id}`, shop, { withCredentials: true });
  }
  // DELETE /shop/delete/{id}
  deleteShop(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/shop/delete/${id}`, { withCredentials: true });
  }

  // ── USER ───────────────────────────────────────────────
  // GET /user/getAllUsers
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/user/getAllUsers`, { withCredentials: true });
  }
  // GET /user/getByEmployeeId/{empId}
  getUserByEmployeeId(empId: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/user/getByEmployeeId/${empId}`, { withCredentials: true });
  }
  // GET /user/getByEmail/{email}
  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/user/getByEmail/${email}`, { withCredentials: true });
  }
  // PUT /user/setActive/{id}
  setUserActive(id: number, active: boolean): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/user/setActive/${id}`, { active }, { withCredentials: true });
  }

  // ── ORDERS (revenue view) ──────────────────────────────
  // GET /order/getAll
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/order/getAll`, { withCredentials: true });
  }

  // ── FLOOR ASSIGNMENTS (shop-floor linking via shop.floorId) ──
  getFloorAssignments(): Observable<FloorAssignment[]> {
    return this.http.get<FloorAssignment[]>(`${this.baseUrl}/shop/getAll`, { withCredentials: true }) as any;
  }
  assignFloor(request: FloorAssignRequest): Observable<FloorAssignment> {
    return this.http.put<FloorAssignment>(`${this.baseUrl}/shop/update/${request.vendorId}`, { floorId: request.floorId }, { withCredentials: true }) as any;
  }
}
