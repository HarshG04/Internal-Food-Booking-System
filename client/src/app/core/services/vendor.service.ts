import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FoodItem, MenuUpdateRequest } from '../models/food-item.model';
import { Order, OrderItem } from '../models/order.model';
import { User } from '../models/user.model';
import { Restaurant } from '../models/restaurant.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VendorService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── FOOD ITEMS (vendor scope) ────────────────────────────
  // GET /api/food-items/shop/{shopId}
  getMenuByShop(shopId: number): Observable<FoodItem[]> {
    return this.http.get<FoodItem[]>(`${this.baseUrl}/food-items/shop/${shopId}`);
  }
  // POST /api/food-items
  addMenuItem(item: MenuUpdateRequest): Observable<FoodItem> {
    return this.http.post<FoodItem>(`${this.baseUrl}/food-items`, item);
  }
  // PUT /api/food-items/{id}
  updateMenuItem(id: number, item: MenuUpdateRequest): Observable<FoodItem> {
    return this.http.put<FoodItem>(`${this.baseUrl}/food-items/${id}`, item);
  }
  // DELETE /api/food-items/{id}
  deleteMenuItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/food-items/${id}`);
  }
  // POST /api/food-items/{id}/image
  uploadFoodItemImage(id: number, file: File): Observable<void> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<void>(`${this.baseUrl}/food-items/${id}/image`, fd);
  }
  // GET /api/food-items/{id}/image
  getFoodItemImageUrl(id: number): string {
    return `${this.baseUrl}/food-items/${id}/image`;
  }

  // ── ORDERS (vendor uses order-items endpoints) ───────────
  // GET /api/order-items/status/{status}
  getOrderItemsByStatus(status: string): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(`${this.baseUrl}/order-items/status/${status}`);
  }
  // GET /api/orders/my-shop — OrderItems belonging to the logged-in vendor's shop
  getMyShopOrders(): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(`${this.baseUrl}/orders/my-shop`);
  }
  // GET /api/orders (kept for backwards compat)
  getVendorOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders`);
  }
  // PATCH /api/order-items/{id}/status?status=
  updateOrderItemStatus(id: number, status: string): Observable<OrderItem> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<OrderItem>(`${this.baseUrl}/order-items/${id}/status`, null, { params });
  }

  // ── SHOPS ────────────────────────────────────────────────
  // GET /api/shops/my — the shop assigned to the logged-in vendor
  getMyShop(): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.baseUrl}/shops/my`);
  }
  // GET /api/shops — full list (kept for backwards compat)
  getAllShops(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUrl}/shops`);
  }

  // ── USERS (admin) ────────────────────────────────────────
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
  // PATCH /api/users/{employeeId}/active?active=
  setUserActive(employeeId: number, active: boolean): Observable<User> {
    const params = new HttpParams().set('active', String(active));
    return this.http.patch<User>(`${this.baseUrl}/users/${employeeId}/active`, null, { params });
  }
}
