import { Injectable } from '@angular/core';
import { EmployeeService } from '../../features/employee/services/employee.service';
import { ProductService } from '../../features/product/services/product.service';
import { SupplierService } from '../../features/supplier/services/supplier.service';
import { ToastMessages } from '../constants/messages.constants';
import { FacilityService } from '../../features/facility/services/facility.service';
import { firstValueFrom, Observable } from 'rxjs';
import { SelectOptions } from '../interfaces/select-options';

@Injectable({
  providedIn: 'root'
})
export class DropdownDataService {
  constructor(
    private employeeService: EmployeeService,
    private productService: ProductService,
    private supplierService: SupplierService,
    private facilityService: FacilityService,
  ) { }

  private async getOptions<T>(
    serviceCall: () => Promise<SelectOptions<T>[]> | Observable<SelectOptions<T>[]>
  ): Promise<SelectOptions<T>[]> {
    try {
      const response = serviceCall();
      const options = response instanceof Observable ? await firstValueFrom(response) : await response;
      return options || [];
    } catch (error) {
      console.error(ToastMessages.ERROR_LOADING_NAMES, error);
      return [];
    }
  }

  getEmployeeOptions(): Promise<SelectOptions<number>[]> {
    return this.getOptions(() => this.employeeService.getEmployeeOptions());
  }

  getProductOptions(): Promise<SelectOptions<number>[]> {
    return this.getOptions(() => this.productService.getProductOptions());
  }

  getSupplierOptions(): Promise<SelectOptions<number>[]> {
    return this.getOptions(() => this.supplierService.getSupplierOptions());
  }

  getFacilitiesOptions(): Promise<SelectOptions<number>[]> {
    return this.getOptions(() => this.facilityService.getFacilityOptions());
  }
}
