import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderItem, PlaceOrderRequest, FeedbackRequest, Feedback } from '../models/order.model';
import { environment } from '../../../environments/environment';

export interface Payment {
  id: number;
  order: Partial<Order>;
  gatewayTxnId: string;
  amount: number;
  method: 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  paidAt: string;
}

export interface CreatePaymentRequest {
  order: { id: number };
  gatewayTxnId: string;
  amount: number;
  method: string;
  status: string;
  paidAt: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── ORDER ──────────────────────────────────────────────
  // GET /api/orders
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders`);
  }
  // GET /api/orders/{id}
  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/orders/${id}`);
  }
  // GET /api/orders/token/{tokenNo}
  getOrderByToken(token: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/orders/token/${token}`);
  }
  // GET /api/orders/employee/{employeeId}
  getOrdersByEmployee(employeeId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders/employee/${employeeId}`);
  }
  // POST /api/orders/place — atomically places order with all items
  placeOrder(request: PlaceOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders/place`, request);
  }

  // ── ORDER ITEMS ────────────────────────────────────────
  // GET /api/order-items
  getAllOrderItems(): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(`${this.baseUrl}/order-items`);
  }
  // GET /api/order-items/{id}
  getOrderItemById(id: number): Observable<OrderItem> {
    return this.http.get<OrderItem>(`${this.baseUrl}/order-items/${id}`);
  }
  // GET /api/order-items/order/{orderId}
  getOrderItemsByOrder(orderId: number): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(`${this.baseUrl}/order-items/order/${orderId}`);
  }
  // GET /api/order-items/user/{userId}
  getOrderItemsByUser(userId: number): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(`${this.baseUrl}/order-items/user/${userId}`);
  }
  // GET /api/order-items/status/{status}
  getOrderItemsByStatus(status: string): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(`${this.baseUrl}/order-items/status/${status}`);
  }
  // PATCH /api/order-items/{id}/status?status=
  updateOrderItemStatus(id: number, status: string): Observable<OrderItem> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<OrderItem>(`${this.baseUrl}/order-items/${id}/status`, null, { params });
  }

  // ── PAYMENT ────────────────────────────────────────────
  // GET /api/payments
  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.baseUrl}/payments`);
  }
  // GET /api/payments/{id}
  getPaymentById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.baseUrl}/payments/${id}`);
  }
  // GET /api/payments/txn/{gatewayTxnId}
  getPaymentByTxnId(txnId: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.baseUrl}/payments/txn/${txnId}`);
  }
  // GET /api/payments/order/{orderId}
  getPaymentsByOrder(orderId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.baseUrl}/payments/order/${orderId}`);
  }
  // GET /api/payments/status/{status}
  getPaymentsByStatus(status: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.baseUrl}/payments/status/${status}`);
  }
  // POST /api/payments
  createPayment(req: CreatePaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(`${this.baseUrl}/payments`, req);
  }
  // PATCH /api/payments/{id}/status?status=
  updatePaymentStatus(id: number, status: string): Observable<Payment> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<Payment>(`${this.baseUrl}/payments/${id}/status`, null, { params });
  }

  // ── FEEDBACK ────────────────────────────────────────────
  // GET /api/feedbacks/order-item/{orderItemId}
  getFeedbackByOrderItem(orderItemId: number): Observable<Feedback> {
    return this.http.get<Feedback>(`${this.baseUrl}/feedbacks/order-item/${orderItemId}`);
  }
  // GET /api/feedbacks/{id}
  getFeedbackById(id: number): Observable<Feedback> {
    return this.http.get<Feedback>(`${this.baseUrl}/feedbacks/${id}`);
  }
  // POST /api/feedbacks
  createFeedback(feedback: FeedbackRequest): Observable<Feedback> {
    return this.http.post<Feedback>(`${this.baseUrl}/feedbacks`, feedback);
  }

  // Convenience
  getMyOrders(employeeId: number): Observable<Order[]> {
    return this.getOrdersByEmployee(employeeId);
  }
}
