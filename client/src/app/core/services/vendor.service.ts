import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FoodItem, MenuUpdateRequest } from '../models/food-item.model';
import { Order } from '../models/order.model';
import { VendorRevenueReport } from '../models/revenue.model';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VendorService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── FOOD ITEMS (vendor scope uses /fooditem/* endpoints) ──
  // GET /fooditem/getByShop/{shopId}
  getMenuByShop(shopId: number): Observable<FoodItem[]> {
    return this.http.get<FoodItem[]>(`${this.baseUrl}/fooditem/getByShop/${shopId}`, { withCredentials: true });
  }
  // POST /fooditem/create
  addMenuItem(item: MenuUpdateRequest): Observable<FoodItem> {
    return this.http.post<FoodItem>(`${this.baseUrl}/fooditem/create`, item, { withCredentials: true });
  }
  // PUT /fooditem/update/{id}
  updateMenuItem(id: number, item: MenuUpdateRequest): Observable<FoodItem> {
    return this.http.put<FoodItem>(`${this.baseUrl}/fooditem/update/${id}`, item, { withCredentials: true });
  }
  // DELETE /fooditem/delete/{id}
  deleteMenuItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/fooditem/delete/${id}`, { withCredentials: true });
  }

  // ── ORDERS (vendor uses /orderitem/* endpoints) ──────────
  // GET /orderitem/getByStatus/{status}
  getOrdersByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/orderitem/getByStatus/${status}`, { withCredentials: true });
  }
  // GET /order/getAll  (vendor sees all orders for their shop)
  getVendorOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/order/getAll`, { withCredentials: true });
  }
  // PUT /orderitem/updateStatus/{id}
  updateOrderItemStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/orderitem/updateStatus/${id}`, { status }, { withCredentials: true });
  }

  // ── USER (manager/vendor admin) ──────────────────────────
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

  // Revenue (placeholder — wire to actual backend if implemented)
  getRevenue(): Observable<VendorRevenueReport> {
    return this.http.get<VendorRevenueReport>(`${this.baseUrl}/order/getAll`, { withCredentials: true }) as any;
  }
}
