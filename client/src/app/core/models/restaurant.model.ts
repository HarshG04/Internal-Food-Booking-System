import { User } from './user.model';

export interface Floor {
  id: number;
  floorNumber: number;
  isActive: boolean;
}

export interface Restaurant {
  id: number;
  floor: Floor;
  name: string;
  isVeg: boolean;
  isOpen: boolean;
  avgRating: number;
  vendor?: Partial<User>;
}

// Shop is the API's term for Restaurant
export type Shop = Restaurant;
