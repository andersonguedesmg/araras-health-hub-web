import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiDropdownItem } from '../../../shared/interfaces/api-dropdown-item';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { SelectOptions } from '../../../shared/interfaces/select-options';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { Employee } from '../interfaces/employee';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

  public loadEmployees(
    pageNumber: number,
    pageSize: number,
    searchTerm: string = '',
  ): Observable<ApiResponse<Employee[]>> {
    const url = this.apiConfig.getUrl('employees');
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('searchTerm', searchTerm);

    return this.http.get<ApiResponse<Employee[]>>(url, { params });
  }

  public createEmployee(employee: Employee): Observable<ApiResponse<Employee>> {
    const url = this.apiConfig.getUrl('employees');
    return this.http.post<ApiResponse<Employee>>(url, employee);
  }

  public getEmployeeById(
    employeeId: number,
  ): Observable<ApiResponse<Employee>> {
    const url = this.apiConfig.getUrl(`employees/${employeeId}`);
    return this.http.get<ApiResponse<Employee>>(url);
  }

  public updateEmployee(
    employee: Employee,
    employeeId: number,
  ): Observable<ApiResponse<Employee>> {
    const url = this.apiConfig.getUrl(`employees/${employeeId}`);
    return this.http.put<ApiResponse<Employee>>(url, employee);
  }

  public changeStatusEmployee(
    employeeId: number,
    employee: Employee,
  ): Observable<ApiResponse<Employee>> {
    const action = employee.isActive ? 'activate' : 'deactivate';
    const url = this.apiConfig.getUrl(`employees/${employeeId}/${action}`);
    return this.http.patch<ApiResponse<Employee>>(url, {});
  }

  public deleteEmployee(employeeId: number): Observable<ApiResponse<Employee>> {
    const url = this.apiConfig.getUrl(`employees/${employeeId}`);
    return this.http.delete<ApiResponse<Employee>>(url);
  }

  public getEmployeeOptions(): Observable<SelectOptions<number>[]> {
    const url = this.apiConfig.getUrl('employees/dropdown');
    return this.http.get<ApiResponse<ApiDropdownItem[]>>(url).pipe(
      map((response) => {
        return (
          response?.data?.map((item) => ({
            label: item.name,
            value: item.id,
          })) || []
        );
      }),
    );
  }
}
