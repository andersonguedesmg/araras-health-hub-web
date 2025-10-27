import { AccountDetails } from "../../account/interfaces/account-details";

export interface FacilityProfile {
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
  facilityAccounts: AccountDetails[];
}
