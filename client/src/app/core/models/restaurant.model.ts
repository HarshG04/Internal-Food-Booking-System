export interface Floor {
  id: number;
  name: string;
  floorNumber: number;
  description?: string;
}

export interface Restaurant {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  cuisine: string;
  floor: Floor;
  rating: number;
  totalRatings: number;
  isOpen: boolean;
  avgPrepTime: number; // minutes
  vendorId: number;
  tags: string[];
}
