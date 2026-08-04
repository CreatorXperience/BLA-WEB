export type AddressType = "SHIPPING" | "BILLING";

export interface Address {
  id: string;
  label?: string | null;
  type: AddressType;
  firstName: string;
  lastName: string;
  phone?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode?: string | null;
  country: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressInput {
  label?: string;
  type?: AddressType;
  firstName: string;
  lastName: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}
