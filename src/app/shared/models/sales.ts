export interface Sale {
  id?: number;
  tableNumber: number;
  clientId: string;
  customerNickname?: string;
  partySize?: number;
  status: string;
  products: [];
  createdAt?: Date;
}
