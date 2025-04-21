import { Injectable } from '@angular/core';
import { EmployeeService } from '../../features/employee/services/employee.service';
import { ProductService } from '../../features/product/services/product.service';
import { ApiResponse } from '../interfaces/apiResponse';
import { SupplierService } from '../../features/supplier/services/supplier.service';
import { ToastMessages } from '../constants/messages.constants';
import { FacilityService } from '../../features/facility/services/facility.service';

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

  async getEmployeeOptions(): Promise<{ label: string; value: any; }[]> {
    try {
      const response: ApiResponse<any[]> = await this.employeeService.getEmployeeOptions();
      return response?.data?.map((employee) => ({
        label: employee.name,
        value: employee.id,
      })) || [];
    } catch (error) {
      console.error(ToastMessages.ERROR_LOADING_NAMES, error);
      return [];
    }
  }

  async getProductOptions(): Promise<{ label: string; value: any; }[]> {
    try {
      const response: ApiResponse<any[]> = await this.productService.getProductOptions();
      return response?.data?.map((product) => ({
        label: product.name,
        value: product.id,
      })) || [];
    } catch (error) {
      console.error(ToastMessages.ERROR_LOADING_NAMES, error);
      return [];
    }
  }

  async getSupplierOptions(): Promise<{ label: string; value: any; }[]> {
    try {
      const response: ApiResponse<any[]> = await this.supplierService.getSupplierOptions();
      return response?.data?.map((supplier) => ({
        label: supplier.name,
        value: supplier.id,
      })) || [];
    } catch (error) {
      console.error(ToastMessages.ERROR_LOADING_NAMES, error);
      return [];
    }
  }

  async getFacilitiesOptions(): Promise<{ label: string; value: any; }[]> {
    try {
      const response: ApiResponse<any[]> = await this.facilityService.getFacilitiesOptions();
      return response?.data?.map((facility) => ({
        label: facility.name,
        value: facility.id,
      })) || [];
    } catch (error) {
      console.error(ToastMessages.ERROR_LOADING_NAMES, error);
      return [];
    }
  }
}
