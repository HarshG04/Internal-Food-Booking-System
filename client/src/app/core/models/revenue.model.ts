export interface RevenueStats {
  date?: string;
  month?: string;
  year?: string;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
}

export interface VendorRevenueReport {
  vendorId: number;
  vendorName: string;
  restaurantName: string;
  floor: string;
  daily: RevenueStats[];
  monthly: RevenueStats[];
  yearly: RevenueStats[];
}

export interface FloorAssignment {
  id: number;
  vendorId: number;
  vendorName: string;
  restaurantName: string;
  floorId: number;
  floorName: string;
  assignedAt: string;
}

export interface FloorAssignRequest {
  vendorId: number;
  floorId: number;
}
