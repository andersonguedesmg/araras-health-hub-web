import { Address } from '../../../../../shared/interfaces/address';
import { Contact } from '../../../../../shared/interfaces/contact';
import { AccountDetails } from '../../account/interfaces/account-details';

export interface FacilityProfile {
  id: number;
  name: string;
  cnes: string;
  address: Address;
  contact: Contact;
  createdOn: string;
  updatedOn: string | null;
  isActive: boolean;
  accounts: AccountDetails[];
}
