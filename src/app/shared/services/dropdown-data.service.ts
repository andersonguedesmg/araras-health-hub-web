import { Injectable } from '@angular/core';
import { firstValueFrom, Observable, of } from 'rxjs';
import { EmployeeService } from '../../features/admin/domains/employee/services/employee.service';
import { FacilityService } from '../../features/admin/domains/facility/services/facility.service';
import { ProductService } from '../../features/product/services/product.service';
import { SupplierService } from '../../features/supplier/services/supplier.service';
import { ToastMessages } from '../constants/messages.constants';
import { SelectOptions } from '../interfaces/select-options';

@Injectable({
  providedIn: 'root',
})
export class DropdownDataService {
  constructor(
    private employeeService: EmployeeService,
    private productService: ProductService,
    private supplierService: SupplierService,
    private facilityService: FacilityService,
  ) {}

  private async getOptions<T>(
    serviceCall: () =>
      | Promise<SelectOptions<T>[]>
      | Observable<SelectOptions<T>[]>,
  ): Promise<SelectOptions<T>[]> {
    try {
      const response = serviceCall();
      const options =
        response instanceof Observable
          ? await firstValueFrom(response)
          : await response;
      return options || [];
    } catch (error) {
      console.error(ToastMessages.ERROR_LOADING_NAMES, error);
      return [];
    }
  }

  getEmployeeOptions(): Promise<SelectOptions<number>[]> {
    // return this.getOptions(() => this.employeeService.getEmployeeOptions());
    return this.getOptions(() => of([]));
  }

  getProductOptions(): Promise<SelectOptions<number>[]> {
    // return this.getOptions(() => this.productService.getProductOptions());
    return this.getOptions(() => of([]));
  }

  getSupplierOptions(): Promise<SelectOptions<number>[]> {
    // return this.getOptions(() => this.supplierService.getSupplierOptions());
    return this.getOptions(() => of([]));
  }

  getFacilitiesOptions(): Promise<SelectOptions<number>[]> {
    // return this.getOptions(() => this.facilityService.getFacilityOptions());
    return this.getOptions(() => of([]));
  }
}
