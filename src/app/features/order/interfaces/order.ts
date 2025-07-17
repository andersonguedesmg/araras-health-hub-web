import { Account } from "../../account/interfaces/account";
import { Employee } from "../../employee/interfaces/employee";
import { OrderItem } from "./orderItem";
import { OrderStatus } from "./orderStatus";

export interface Order {
  id: number;
  observation: string;

  orderStatusId: number;
  orderStatus: OrderStatus;

  createdAt: Date;
  createdByEmployeeId: number;
  createdByEmployee: Employee;
  createdByAccountId: number;
  createdByAccount: Account;

  approvedAt: Date;
  approvedByEmployeeId: number;
  approvedByEmployee: Employee;
  approvedByAccountId: number;
  approvedByAccount: Account;

  separatedAt: Date;
  separatedByEmployeeId: number;
  separatedByEmployee: Employee;
  separatedByAccountId: number;
  separatedByAccount: Account;

  finalizedAt: Date;
  finalizedByEmployeeId: number;
  finalizedByEmployee: Employee;
  finalizedByAccountId: number;
  finalizedByAccount: Account;

  orderItems: OrderItem[];
}
