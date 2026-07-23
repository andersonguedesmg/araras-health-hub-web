import { Address } from '../../../shared/interfaces/address';
import { Contact } from '../../../shared/interfaces/contact';
import { Account } from '../../admin/domains/account/interfaces/account';

export interface Facility {
  id: number;
  name: string;
  cnes: string;
  address: Address;
  contact: Contact;
  createdOn: string;
  updatedOn: string;
  isActive: boolean;
  accountUsers: Account[];
}
