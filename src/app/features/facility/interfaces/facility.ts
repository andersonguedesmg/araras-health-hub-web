import { Account } from "../../account/interfaces/account";

export interface Facility {
  id: number;
  name: string;
  cep: string;
  address: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  email: string;
  phone: string;
  createdOn: string;
  updatedOn: string;
  isActive: boolean;
  accountUsers: Account[];
}
