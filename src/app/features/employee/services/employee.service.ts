import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Employee } from '../interfaces/employee';
import { ApiResponse } from '../../../shared/interfaces/apiResponse';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { SelectOptions } from '../../../shared/interfaces/select-options';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  async getAllEmployees(): Promise<ApiResponse<Employee[]>> {
    const url = this.apiConfig.getEmployeeUrl('getAll');
    return firstValueFrom(this.http.get<ApiResponse<Employee[]>>(url));
  }

  async createEmployee(employee: Employee): Promise<ApiResponse<Employee>> {
    const url = this.apiConfig.getEmployeeUrl('create');
    return firstValueFrom(this.http.post<ApiResponse<Employee>>(url, employee));
  }

  async updateEmployee(employee: Employee, employeeId: number): Promise<ApiResponse<Employee>> {
    const url = this.apiConfig.getEmployeeUrl(`update/${employeeId}`);
    return firstValueFrom(this.http.put<ApiResponse<Employee>>(url, employee));
  }

  async deleteEmployee(employeeId: number): Promise<ApiResponse<Employee>> {
    const url = this.apiConfig.getEmployeeUrl(`delete/${employeeId}`);
    return firstValueFrom(this.http.delete<ApiResponse<Employee>>(url));
  }

  async changeStatusEmployee(employeeId: number, employee: Employee): Promise<ApiResponse<Employee>> {
    const url = this.apiConfig.getEmployeeUrl(`changeStatus/${employeeId}`);
    return firstValueFrom(this.http.patch<ApiResponse<Employee>>(url, employee));
  }

  async getAllEmployeeNames(): Promise<ApiResponse<SelectOptions<number>[]>> {
    const url = this.apiConfig.getEmployeeUrl('getNames');
    return firstValueFrom(this.http.get<ApiResponse<SelectOptions<number>[]>>(url));
  }
}
