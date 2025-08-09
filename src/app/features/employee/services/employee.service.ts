import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable, tap } from 'rxjs';
import { Employee } from '../interfaces/employee';
import { ApiResponse } from '../../../shared/interfaces/apiResponse';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { SelectOptions } from '../../../shared/interfaces/select-options';
import { ApiDropdownItem } from '../../../shared/interfaces/ApiDropdownItem';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  public employees$ = this.employeesSubject.asObservable();

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  public loadEmployees(pageNumber: number, pageSize: number): Observable<ApiResponse<Employee[]>> {
    const url = this.apiConfig.getUrl('employee', `getAll?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return this.http.get<ApiResponse<Employee[]>>(url).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.employeesSubject.next(response.data);
        }
      })
    );
  }

  public createEmployee(employee: Employee): Observable<ApiResponse<Employee>> {
    const url = this.apiConfig.getUrl('employee', 'create');
    return this.http.post<ApiResponse<Employee>>(url, employee).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentEmployees = this.employeesSubject.getValue();
          this.employeesSubject.next([...currentEmployees, response.data]);
        }
      })
    );
  }

  public getEmployeeById(employeeId: number): Observable<ApiResponse<Employee>> {
    const url = this.apiConfig.getUrl('employee', `getById/${employeeId}`);
    return this.http.get<ApiResponse<Employee>>(url);
  }

  public updateEmployee(employee: Employee, employeeId: number): Observable<ApiResponse<Employee>> {
    const url = this.apiConfig.getUrl('employee', `update/${employeeId}`);
    return this.http.put<ApiResponse<Employee>>(url, employee).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentEmployees = this.employeesSubject.getValue();
          const updatedList = currentEmployees.map(p => p.id === employeeId ? response.data! : p);
          this.employeesSubject.next(updatedList);
        }
      })
    );
  }

  public changeStatusEmployee(employeeId: number, employee: Employee): Observable<ApiResponse<Employee>> {
    const url = this.apiConfig.getUrl('employee', `changeStatus/${employeeId}`);
    return this.http.patch<ApiResponse<Employee>>(url, employee).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentEmployees = this.employeesSubject.getValue();
          const updatedList = currentEmployees.map(p => p.id === employeeId ? response.data! : p);
          this.employeesSubject.next(updatedList);
        }
      })
    );
  }

  public deleteEmployee(employeeId: number): Observable<ApiResponse<Employee>> {
    const url = this.apiConfig.getUrl('employee', `delete/${employeeId}`);
    return this.http.delete<ApiResponse<Employee>>(url).pipe(
      tap(response => {
        if (response.success) {
          const currentEmployees = this.employeesSubject.getValue();
          const updatedList = currentEmployees.filter(p => p.id !== employeeId);
          this.employeesSubject.next(updatedList);
        }
      })
    );
  }
  public getEmployeeOptions(): Promise<SelectOptions<number>[]> {
    const url = this.apiConfig.getUrl('employee', 'getDropdownOptions');
    return firstValueFrom(this.http.get<ApiResponse<ApiDropdownItem[]>>(url))
      .then(response => {
        return response?.data?.map((item) => ({
          label: item.name,
          value: item.id,
        })) || [];
      })
      .catch(error => {
        return [];
      });
  }
}
