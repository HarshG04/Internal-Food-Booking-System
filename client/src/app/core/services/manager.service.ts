import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Floor, Restaurant } from '../models/restaurant.model';
import { User, CreateUserRequest } from '../models/user.model';
import { Order, OrderItem } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ManagerService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── FLOOR ──────────────────────────────────────────────
  // GET /api/floors
  getAllFloors(): Observable<Floor[]> {
    return this.http.get<Floor[]>(`${this.baseUrl}/floors`);
  }
  // GET /api/floors/active
  getActiveFloors(): Observable<Floor[]> {
    return this.http.get<Floor[]>(`${this.baseUrl}/floors/active`);
  }
  // POST /api/floors
  createFloor(floor: Partial<Floor>): Observable<Floor> {
    return this.http.post<Floor>(`${this.baseUrl}/floors`, floor);
  }
  // PUT /api/floors/{id}
  updateFloor(id: number, floor: Partial<Floor>): Observable<Floor> {
    return this.http.put<Floor>(`${this.baseUrl}/floors/${id}`, floor);
  }
  // DELETE /api/floors/{id}
  deleteFloor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/floors/${id}`);
  }

  // ── SHOP ───────────────────────────────────────────────
  // GET /api/shops
  getAllShops(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUrl}/shops`);
  }
  // GET /api/shops/floor/{floorId}
  getShopsByFloor(floorId: number): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUrl}/shops/floor/${floorId}`);
  }
  // POST /api/shops
  createShop(shop: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.post<Restaurant>(`${this.baseUrl}/shops`, shop);
  }
  // PUT /api/shops/{id}
  updateShop(id: number, shop: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.baseUrl}/shops/${id}`, shop);
  }
  // DELETE /api/shops/{id}
  deleteShop(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/shops/${id}`);
  }

  // ── USER ───────────────────────────────────────────────
  // GET /api/users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }
  // GET /api/users/{employeeId}
  getUserByEmployeeId(empId: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${empId}`);
  }
  // GET /api/users/by-email?email=
  getUserByEmail(email: string): Observable<User> {
    const params = new HttpParams().set('email', email);
    return this.http.get<User>(`${this.baseUrl}/users/by-email`, { params });
  }
  // POST /api/users
  createUser(user: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, user);
  }
  // PATCH /api/users/{employeeId}/active?active=
  setUserActive(employeeId: number, active: boolean): Observable<User> {
    const params = new HttpParams().set('active', String(active));
    return this.http.patch<User>(`${this.baseUrl}/users/${employeeId}/active`, null, { params });
  }

  // ── VENDOR ASSIGNMENT ──────────────────────────────────
  // POST /api/shops/{shopId}/vendor/{vendorId}
  assignVendorToShop(shopId: number, vendorId: number): Observable<Restaurant> {
    return this.http.post<Restaurant>(`${this.baseUrl}/shops/${shopId}/vendor/${vendorId}`, null);
  }
  // PUT /api/shops/{shopId}/vendor/{vendorId}
  reassignVendorToShop(shopId: number, vendorId: number): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.baseUrl}/shops/${shopId}/vendor/${vendorId}`, null);
  }
  // DELETE /api/shops/{shopId}/vendor
  unassignVendorFromShop(shopId: number): Observable<Restaurant> {
    return this.http.delete<Restaurant>(`${this.baseUrl}/shops/${shopId}/vendor`);
  }

  // ── IMAGES ───────────────────────────────────────────
  // POST /api/shops/{id}/image
  uploadShopImage(id: number, file: File): Observable<void> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<void>(`${this.baseUrl}/shops/${id}/image`, fd);
  }
  // GET /api/shops/{id}/image
  getShopImageUrl(id: number): string {
    return `${this.baseUrl}/shops/${id}/image`;
  }

  // ── ORDERS (revenue view) ──────────────────────────────
  // GET /api/orders
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders`);
  }
  // GET /api/order-items — all order items across all shops
  getAllOrderItems(): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(`${this.baseUrl}/order-items`);
  }
}
