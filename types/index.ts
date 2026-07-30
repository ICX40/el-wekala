export type Role = "Admin" | "Seller" | "Customer" | "Support";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  role: Role;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface SellerProfile extends User {
  storeName: string;
  storeDescription: string;
  storeLogo?: string;
  idCardImage?: string;
  paymentInfo: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    instapay?: string;
    vodafoneCash?: string;
  };
  status: "Pending" | "Approved" | "Rejected" | "Suspended";
  balance: number;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  discount?: number;
  stock: number;
  sku: string;
  barcode?: string;
  images: string[];
  video?: string;
  colors?: string[];
  sizes?: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  shippingCost?: number;
  categoryId: string;
  status: "Active" | "Hidden" | "Deleted" | "UnderReview";
  createdAt: Date | string;
  updatedAt: Date | string;
  averageRating: number;
  totalReviews: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  parentCategoryId?: string; 
}

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export interface OrderItem {
  id: string;
  productId: string;
  sellerId: string;
  name: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingCost: number;
  discountAmount: number;
  finalAmount: number;
  status: OrderStatus;
  shippingAddress: {
    fullName: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    zipCode?: string;
  };
  paymentMethod: "Vodafone Cash" | "InstaPay" | "Opay" | "Credit Card" | "Cash on Delivery";
  paymentStatus: "Pending" | "Completed" | "Failed" | "Refunded";
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number; 
  comment: string;
  images?: string[];
  createdAt: Date | string;
}

export interface WithdrawRequest {
  id: string;
  sellerId: string;
  amount: number;
  method: "Vodafone Cash" | "InstaPay" | "Bank Transfer";
  details: string; 
  status: "Pending" | "Approved" | "Rejected";
  createdAt: Date | string;
  processedAt?: Date | string;
}