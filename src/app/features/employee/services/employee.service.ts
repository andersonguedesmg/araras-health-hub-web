import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { ApiDropdownItem } from '../../../shared/interfaces/api-dropdown-item';
import { ApiResponse } from '../../../shared/interfaces/api-response';
import { SelectOptions } from '../../../shared/interfaces/select-options';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { Employee } from '../interfaces/employee';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  private employeesSignal = signal<Employee[]>([]);

  public employees = this.employeesSignal.asReadonly();

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

    return this.http.get<ApiResponse<Employee[]>>(url, { params }).pipe(
      tap((response) => {
        if (response && response.data) {
          this.employeesSignal.set(response.data);
        }
      }),
    );
  }

  public createEmployee(employee: Employee): Observable<ApiResponse<Employee>> {
    const url = this.apiConfig.getUrl('employees');
    return this.http.post<ApiResponse<Employee>>(url, employee).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.employeesSignal.update((current) => [
            response.data!,
            ...current,
          ]);
        }
      }),
    );
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
    return this.http.put<ApiResponse<Employee>>(url, employee).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.employeesSignal.update((current) =>
            current.map((item) =>
              item.id === employeeId ? response.data! : item,
            ),
          );
        }
      }),
    );
  }

  public changeStatusEmployee(
    employeeId: number,
    employee: Employee,
  ): Observable<ApiResponse<Employee>> {
    const action = employee.isActive ? 'activate' : 'deactivate';
    const url = this.apiConfig.getUrl(`employees/${employeeId}/${action}`);

    return this.http.patch<ApiResponse<Employee>>(url, {}).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.employeesSignal.update((current) =>
            current.map((item) =>
              item.id === employeeId ? response.data! : item,
            ),
          );
        }
      }),
    );
  }

  public deleteEmployee(employeeId: number): Observable<ApiResponse<Employee>> {
    const url = this.apiConfig.getUrl(`employees/${employeeId}`);
    return this.http.delete<ApiResponse<Employee>>(url).pipe(
      tap((response) => {
        if (response.success) {
          this.employeesSignal.update((current) =>
            current.filter((item) => item.id !== employeeId),
          );
        }
      }),
    );
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
