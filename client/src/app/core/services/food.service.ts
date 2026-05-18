import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Restaurant } from '../models/restaurant.model';
import { FoodItem, MenuUpdateRequest } from '../models/food-item.model';
import { Floor } from '../models/restaurant.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FoodService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── FLOOR ──────────────────────────────────────────────
  // GET /floor/getAll
  getFloors(): Observable<Floor[]> {
    return this.http.get<Floor[]>(`${this.baseUrl}/floor/getAll`, { withCredentials: true });
  }
  // GET /floor/getActive
  getActiveFloors(): Observable<Floor[]> {
    return this.http.get<Floor[]>(`${this.baseUrl}/floor/getActive`, { withCredentials: true });
  }
  // GET /floor/get/{id}
  getFloorById(id: number): Observable<Floor> {
    return this.http.get<Floor>(`${this.baseUrl}/floor/get/${id}`, { withCredentials: true });
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
  // GET /shop/get/{id}
  getShopById(id: number): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.baseUrl}/shop/get/${id}`, { withCredentials: true });
  }
  // GET /shop/getByFloor/{floorId}
  getShopsByFloor(floorId: number): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUrl}/shop/getByFloor/${floorId}`, { withCredentials: true });
  }
  // GET /shop/getOpen
  getOpenShops(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUrl}/shop/getOpen`, { withCredentials: true });
  }
  // GET /shop/getVeg
  getVegShops(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUrl}/shop/getVeg`, { withCredentials: true });
  }
  createShop(shop: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.post<Restaurant>(`${this.baseUrl}/shop/create`, shop, { withCredentials: true });
  }
  updateShop(id: number, shop: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.baseUrl}/shop/update/${id}`, shop, { withCredentials: true });
  }
  deleteShop(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/shop/delete/${id}`, { withCredentials: true });
  }

  // ── FOOD ITEMS ─────────────────────────────────────────
  // GET /fooditem/getAll
  getAllFoodItems(): Observable<FoodItem[]> {
    return this.http.get<FoodItem[]>(`${this.baseUrl}/fooditem/getAll`, { withCredentials: true });
  }
  // GET /fooditem/get/{id}
  getFoodItemById(id: number): Observable<FoodItem> {
    return this.http.get<FoodItem>(`${this.baseUrl}/fooditem/get/${id}`, { withCredentials: true });
  }
  // GET /fooditem/getByShop/{shopId}
  getFoodItemsByShopId(shopId: number): Observable<FoodItem[]> {
    return this.http.get<FoodItem[]>(`${this.baseUrl}/fooditem/getByShop/${shopId}`, { withCredentials: true });
  }
  // GET /fooditem/search?name=&category=&isVeg=
  searchFoodItems(params: { name?: string; category?: string; isVeg?: boolean }): Observable<FoodItem[]> {
    let httpParams = new HttpParams();
    if (params.name) httpParams = httpParams.set('name', params.name);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.isVeg !== undefined) httpParams = httpParams.set('isVeg', String(params.isVeg));
    return this.http.get<FoodItem[]>(`${this.baseUrl}/fooditem/search`, { params: httpParams, withCredentials: true });
  }
  // POST /fooditem/create
  createFoodItem(item: MenuUpdateRequest): Observable<FoodItem> {
    return this.http.post<FoodItem>(`${this.baseUrl}/fooditem/create`, item, { withCredentials: true });
  }
  // PUT /fooditem/update/{id}
  updateFoodItem(id: number, item: MenuUpdateRequest): Observable<FoodItem> {
    return this.http.put<FoodItem>(`${this.baseUrl}/fooditem/update/${id}`, item, { withCredentials: true });
  }
  // DELETE /fooditem/delete/{id}
  deleteFoodItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/fooditem/delete/${id}`, { withCredentials: true });
  }

  // Convenience helpers used by home page
  getTrendingItems(): Observable<FoodItem[]> {
    return this.searchFoodItems({ name: '' });
  }
  getFastItems(): Observable<FoodItem[]> {
    return this.getAllFoodItems();
  }
}
