export interface Sale {
  id?: number;
  clientId: string;
  isDelivery: boolean;
  tableNumber?: number | null;
  customerNickname?: string;
  partySize?: number;
  status: string;
  products: [];
  createdAt?: Date;
}
