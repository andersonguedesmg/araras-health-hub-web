import { Address } from "../../../shared/interfaces/address";
import { Contact } from "../../../shared/interfaces/contact";

export interface Supplier {
  id: number;
  cnpj: string;
  legalName: string;
  tradeName: string;
  address: Address;
  contact: Contact;
  createdOn: string;
  updatedOn: string;
  isActive: boolean;
}
