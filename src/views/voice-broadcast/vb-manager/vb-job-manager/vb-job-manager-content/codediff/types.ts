export interface DeliveryDetailListNumsI {
  verify_dispatch: string;
  mark_dispatch: string;
  circulation: string;
  total: number;
}

export interface DeliveryDetailListPersonI {
  dis_id: number
  type: number
  user_name: string;
  nums: string;
  disabled: boolean;
}
