import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, PlaceOrderRequest, FeedbackRequest } from '../models/order.model';
import { environment } from '../../../environments/environment';

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  gatewayTxnId?: string;
  method: string;
  createdAt: string;
}

export interface CreatePaymentRequest {
  orderId: number;
  amount: number;
  method: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  foodItemId: number;
  foodItemName: string;
  quantity: number;
  price: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── ORDER ──────────────────────────────────────────────
  // GET /order/getAll
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/order/getAll`, { withCredentials: true });
  }
  // GET /order/get/{id}
  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/order/get/${id}`, { withCredentials: true });
  }
  // GET /order/getByToken/{token}
  getOrderByToken(token: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/order/getByToken/${token}`, { withCredentials: true });
  }
  // GET /order/getByEmployee/{employeeId}
  getOrdersByEmployee(employeeId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/order/getByEmployee/${employeeId}`, { withCredentials: true });
  }
  // POST /order/create  (before payment)
  createOrder(request: PlaceOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/order/create`, request, { withCredentials: true });
  }
  // POST /order/place  (after payment success)
  placeOrder(request: PlaceOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/order/place`, request, { withCredentials: true });
  }

  // ── ORDER ITEMS ────────────────────────────────────────
  // GET /orderitem/getAll
  getAllOrderItems(): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(`${this.baseUrl}/orderitem/getAll`, { withCredentials: true });
  }
  // GET /orderitem/get/{id}
  getOrderItemById(id: number): Observable<OrderItem> {
    return this.http.get<OrderItem>(`${this.baseUrl}/orderitem/get/${id}`, { withCredentials: true });
  }
  // GET /orderitem/getByOrder/{orderId}
  getOrderItemsByOrder(orderId: number): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(`${this.baseUrl}/orderitem/getByOrder/${orderId}`, { withCredentials: true });
  }
  // GET /orderitem/getByUser/{userId}
  getOrderItemsByUser(userId: number): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(`${this.baseUrl}/orderitem/getByUser/${userId}`, { withCredentials: true });
  }
  // GET /orderitem/getByStatus/{status}
  getOrderItemsByStatus(status: string): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(`${this.baseUrl}/orderitem/getByStatus/${status}`, { withCredentials: true });
  }
  // POST /orderitem/create
  createOrderItem(item: Partial<OrderItem>): Observable<OrderItem> {
    return this.http.post<OrderItem>(`${this.baseUrl}/orderitem/create`, item, { withCredentials: true });
  }
  // PUT /orderitem/updateStatus/{id}
  updateOrderItemStatus(id: number, status: string): Observable<OrderItem> {
    return this.http.put<OrderItem>(`${this.baseUrl}/orderitem/updateStatus/${id}`, { status }, { withCredentials: true });
  }

  // ── PAYMENT ────────────────────────────────────────────
  // GET /payment/getAll
  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.baseUrl}/payment/getAll`, { withCredentials: true });
  }
  // GET /payment/get/{id}
  getPaymentById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.baseUrl}/payment/get/${id}`, { withCredentials: true });
  }
  // GET /payment/getByGatewayTxnId/{txnId}
  getPaymentByGatewayTxnId(txnId: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.baseUrl}/payment/getByGatewayTxnId/${txnId}`, { withCredentials: true });
  }
  // GET /payment/getByOrder/{orderId}
  getPaymentsByOrder(orderId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.baseUrl}/payment/getByOrder/${orderId}`, { withCredentials: true });
  }
  // GET /payment/getByStatus/{status}
  getPaymentsByStatus(status: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.baseUrl}/payment/getByStatus/${status}`, { withCredentials: true });
  }
  // POST /payment/create
  createPayment(req: CreatePaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(`${this.baseUrl}/payment/create`, req, { withCredentials: true });
  }
  // PUT /payment/updateStatus/{id}
  updatePaymentStatus(id: number, status: string): Observable<Payment> {
    return this.http.put<Payment>(`${this.baseUrl}/payment/updateStatus/${id}`, { status }, { withCredentials: true });
  }

  // ── FEEDBACK ────────────────────────────────────────────
  // GET /feedback/getByOrderItem/{orderItemId}
  getFeedbackByOrderItem(orderItemId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/feedback/getByOrderItem/${orderItemId}`, { withCredentials: true });
  }
  // GET /feedback/get/{id}
  getFeedbackById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/feedback/get/${id}`, { withCredentials: true });
  }
  // POST /feedback/create
  createFeedback(feedback: FeedbackRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/feedback/create`, feedback, { withCredentials: true });
  }

  // Convenience
  getMyOrders(employeeId: string): Observable<Order[]> {
    return this.getOrdersByEmployee(employeeId);
  }
}
