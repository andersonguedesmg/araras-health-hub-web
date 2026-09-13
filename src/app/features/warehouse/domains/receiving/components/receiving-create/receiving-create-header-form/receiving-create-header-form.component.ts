import { CurrencyPipe, NgClass } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectLazyLoadEvent, SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { EmployeeService } from '../../../../../../admin/domains/employee/services/employee/employee.service';
import { SupplierService } from '../../../../../../admin/domains/supplier/services/supplier/supplier.service';
import { ReceivingHeaderFormData } from '../../../interfaces/receiving';

export interface SelectOption<T> {
  label: string;
  value: T;
  subtitle?: string;
}

@Component({
  selector: 'app-receiving-create-header-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    CurrencyPipe,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './receiving-create-header-form.component.html',
  styleUrl: './receiving-create-header-form.component.scss',
})
export class ReceivingCreateHeaderFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly supplierService = inject(SupplierService);
  private readonly employeeService = inject(EmployeeService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly invoiceInputRef = viewChild<ElementRef<HTMLInputElement>>('invoiceInput');

  readonly calculatedItemsTotal = input<number>(0);
  readonly initialData = input<ReceivingHeaderFormData | undefined>(undefined);

  readonly formChange = output<ReceivingHeaderFormData>();

  protected readonly formSubmitted = signal<boolean>(false);

  protected readonly supplierOptions = signal<SelectOption<number>[]>([]);
  protected readonly isSupplierLoading = signal<boolean>(false);
  private supplierPage = 1;
  private readonly dropdownPageSize = 10;
  private supplierSearchTerm = '';
  private hasNextSupplierPage = true;
  private isSupplierRequestInProgress = false;
  private readonly supplierFilterSubject = new Subject<string>();
  private supplierFilterSubscription?: Subscription;

  protected readonly employeeOptions = signal<SelectOption<number>[]>([]);
  protected readonly isEmployeeLoading = signal<boolean>(false);
  private employeePage = 1;
  private employeeSearchTerm = '';
  private hasNextEmployeePage = true;
  private isEmployeeRequestInProgress = false;
  private readonly employeeFilterSubject = new Subject<string>();
  private employeeFilterSubscription?: Subscription;

  protected readonly isGlobalLoading = computed(() => this.isSupplierLoading() || this.isEmployeeLoading());

  protected readonly form: FormGroup = this.fb.group({
    invoiceNumber: ['', [Validators.required, Validators.maxLength(50)]],
    supplyAuthorization: ['', [Validators.required, Validators.maxLength(50)]],
    totalValue: [null as number | null, [Validators.required, Validators.min(0.01)]],
    supplierId: [null as number | null, [Validators.required]],
    responsibleId: [null as number | null, [Validators.required]],
    receivingDate: [new Date(), [Validators.required]],
    observation: ['', [Validators.maxLength(500)]],
  });

  constructor() {
    this.registerFilterDebounces();
  }

  ngOnInit(): void {
    this.initializeDropdowns();

    this.form.valueChanges.subscribe(() => {
      this.emitFormState();
    });
  }

  ngOnDestroy(): void {
    this.supplierFilterSubscription?.unsubscribe();
    this.employeeFilterSubscription?.unsubscribe();
  }

  private registerFilterDebounces(): void {
    this.supplierFilterSubscription = this.supplierFilterSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.supplierSearchTerm = searchTerm;
        this.resetAndReloadSupplierDropdown();
      });

    this.employeeFilterSubscription = this.employeeFilterSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.employeeSearchTerm = searchTerm;
        this.resetAndReloadEmployeeDropdown();
      });
  }

  private async initializeDropdowns(): Promise<void> {
    const data = this.initialData();

    this.supplierPage = 1;
    this.hasNextSupplierPage = true;
    this.isSupplierRequestInProgress = false;
    this.supplierOptions.set([]);

    this.employeePage = 1;
    this.hasNextEmployeePage = true;
    this.isEmployeeRequestInProgress = false;
    this.employeeOptions.set([]);

    if (data?.supplierId) {
      await this.ensureSelectedSupplierIsLoaded(data.supplierId);
    }
    if (data?.responsibleId) {
      await this.ensureSelectedEmployeeIsLoaded(data.responsibleId);
    }

    await Promise.all([this.loadFirstPageSupplierComplement(), this.loadFirstPageEmployeeComplement()]);

    if (data) {
      this.form.patchValue(data);
    }
  }

  private async resetAndReloadSupplierDropdown(): Promise<void> {
    this.supplierPage = 1;
    this.hasNextSupplierPage = true;
    this.isSupplierRequestInProgress = false;

    const currentSupplierId = this.form.get('supplierId')?.value as number | null;
    const selectedSupplier = this.supplierOptions().find((opt) => opt.value === currentSupplierId);
    this.supplierOptions.set(selectedSupplier ? [selectedSupplier] : []);

    await this.loadNextSupplierPage();
  }

  private loadFirstPageSupplierComplement(): Promise<void> {
    if (this.isSupplierRequestInProgress) return Promise.resolve();

    this.isSupplierRequestInProgress = true;
    this.isSupplierLoading.set(true);

    return new Promise((resolve) => {
      this.supplierService.getSupplierPagedOptions(1, this.dropdownPageSize, this.supplierSearchTerm).subscribe({
        next: (response) => {
          const incomingOptions: SelectOption<number>[] = response?.data || [];
          this.hasNextSupplierPage = response.hasNextPage ?? incomingOptions.length === this.dropdownPageSize;

          this.supplierOptions.update((existing) => {
            const existingIds = new Set(existing.map((item) => item.value));
            const filteredNew = incomingOptions.filter((item) => !existingIds.has(item.value));
            return [...existing, ...filteredNew];
          });

          this.supplierPage = 2;
          this.isSupplierRequestInProgress = false;
          this.isSupplierLoading.set(false);
          resolve();
        },
        error: () => {
          this.isSupplierRequestInProgress = false;
          this.isSupplierLoading.set(false);
          resolve();
        },
      });
    });
  }

  private loadNextSupplierPage(): Promise<void> {
    if (this.isSupplierRequestInProgress || !this.hasNextSupplierPage) {
      return Promise.resolve();
    }

    this.isSupplierRequestInProgress = true;
    this.isSupplierLoading.set(true);

    return new Promise((resolve) => {
      this.supplierService
        .getSupplierPagedOptions(this.supplierPage, this.dropdownPageSize, this.supplierSearchTerm)
        .subscribe({
          next: (response) => {
            const incomingOptions: SelectOption<number>[] = response?.data || [];
            this.hasNextSupplierPage = response.hasNextPage ?? incomingOptions.length === this.dropdownPageSize;

            this.supplierOptions.update((existing) => {
              const existingIds = new Set(existing.map((item) => item.value));
              const filteredNew = incomingOptions.filter((item) => !existingIds.has(item.value));
              return [...existing, ...filteredNew];
            });

            this.supplierPage++;
            this.isSupplierRequestInProgress = false;
            this.isSupplierLoading.set(false);
            resolve();
          },
          error: () => {
            this.isSupplierRequestInProgress = false;
            this.isSupplierLoading.set(false);
            resolve();
          },
        });
    });
  }

  private ensureSelectedSupplierIsLoaded(selectedId: number): Promise<void> {
    const alreadyLoaded = this.supplierOptions().some((item) => item.value === selectedId);
    if (alreadyLoaded) return Promise.resolve();

    this.isSupplierLoading.set(true);

    return new Promise((resolve) => {
      this.supplierService.getSupplierById(selectedId).subscribe({
        next: (response) => {
          if (response && response.data) {
            const matchedItem: SelectOption<number> = {
              label: response.data.legalName,
              value: response.data.id,
              subtitle: response.data.cnpj,
            };
            this.supplierOptions.set([matchedItem]);
          }
          this.isSupplierLoading.set(false);
          resolve();
        },
        error: () => {
          this.isSupplierLoading.set(false);
          resolve();
        },
      });
    });
  }

  protected onSupplierLazyLoad(event: SelectLazyLoadEvent): void {
    if (this.isSupplierRequestInProgress || !this.hasNextSupplierPage || this.isSupplierLoading()) {
      return;
    }

    const lastLoadedIndex = event.last ?? 0;
    const currentListLength = this.supplierOptions().length;

    if (lastLoadedIndex >= currentListLength - 3 || currentListLength === 0) {
      this.loadNextSupplierPage();
    }
  }

  protected onSupplierFilter(event: { filter: string }): void {
    this.supplierFilterSubject.next(event.filter || '');
  }

  protected onSupplierSelect(option: SelectOption<number>): void {
    if (option) {
      this.form.patchValue({ supplierId: option.value });
    }
  }

  private async resetAndReloadEmployeeDropdown(): Promise<void> {
    this.employeePage = 1;
    this.hasNextEmployeePage = true;
    this.isEmployeeRequestInProgress = false;

    const currentResponsibleId = this.form.get('responsibleId')?.value as number | null;
    const selectedEmployee = this.employeeOptions().find((opt) => opt.value === currentResponsibleId);
    this.employeeOptions.set(selectedEmployee ? [selectedEmployee] : []);

    await this.loadNextEmployeePage();
  }

  private loadFirstPageEmployeeComplement(): Promise<void> {
    if (this.isEmployeeRequestInProgress) return Promise.resolve();

    this.isEmployeeRequestInProgress = true;
    this.isEmployeeLoading.set(true);

    return new Promise((resolve) => {
      this.employeeService.getEmployeePagedOptions(1, this.dropdownPageSize, this.employeeSearchTerm).subscribe({
        next: (response) => {
          const incomingOptions: SelectOption<number>[] = response?.data || [];
          this.hasNextEmployeePage = response.hasNextPage ?? incomingOptions.length === this.dropdownPageSize;

          this.employeeOptions.update((existing) => {
            const existingIds = new Set(existing.map((item) => item.value));
            const filteredNew = incomingOptions.filter((item) => !existingIds.has(item.value));
            return [...existing, ...filteredNew];
          });

          this.employeePage = 2;
          this.isEmployeeRequestInProgress = false;
          this.isEmployeeLoading.set(false);
          resolve();
        },
        error: () => {
          this.isEmployeeRequestInProgress = false;
          this.isEmployeeLoading.set(false);
          resolve();
        },
      });
    });
  }

  private loadNextEmployeePage(): Promise<void> {
    if (this.isEmployeeRequestInProgress || !this.hasNextEmployeePage) {
      return Promise.resolve();
    }

    this.isEmployeeRequestInProgress = true;
    this.isEmployeeLoading.set(true);

    return new Promise((resolve) => {
      this.employeeService
        .getEmployeePagedOptions(this.employeePage, this.dropdownPageSize, this.employeeSearchTerm)
        .subscribe({
          next: (response) => {
            const incomingOptions: SelectOption<number>[] = response?.data || [];
            this.hasNextEmployeePage = response.hasNextPage ?? incomingOptions.length === this.dropdownPageSize;

            this.employeeOptions.update((existing) => {
              const existingIds = new Set(existing.map((item) => item.value));
              const filteredNew = incomingOptions.filter((item) => !existingIds.has(item.value));
              return [...existing, ...filteredNew];
            });

            this.employeePage++;
            this.isEmployeeRequestInProgress = false;
            this.isEmployeeLoading.set(false);
            resolve();
          },
          error: () => {
            this.isEmployeeRequestInProgress = false;
            this.isEmployeeLoading.set(false);
            resolve();
          },
        });
    });
  }

  private ensureSelectedEmployeeIsLoaded(selectedId: number): Promise<void> {
    const alreadyLoaded = this.employeeOptions().some((item) => item.value === selectedId);
    if (alreadyLoaded) return Promise.resolve();

    this.isEmployeeLoading.set(true);

    return new Promise((resolve) => {
      this.employeeService.getEmployeeById(selectedId).subscribe({
        next: (response) => {
          if (response && response.data) {
            const matchedItem: SelectOption<number> = {
              label: response.data.name,
              value: response.data.id,
              subtitle: response.data.cpf,
            };
            this.employeeOptions.set([matchedItem]);
          }
          this.isEmployeeLoading.set(false);
          resolve();
        },
        error: () => {
          this.isEmployeeLoading.set(false);
          resolve();
        },
      });
    });
  }

  protected onEmployeeLazyLoad(event: SelectLazyLoadEvent): void {
    if (this.isEmployeeRequestInProgress || !this.hasNextEmployeePage || this.isEmployeeLoading()) {
      return;
    }

    const lastLoadedIndex = event.last ?? 0;
    const currentListLength = this.employeeOptions().length;

    if (lastLoadedIndex >= currentListLength - 3 || currentListLength === 0) {
      this.loadNextEmployeePage();
    }
  }

  protected onEmployeeFilter(event: { filter: string }): void {
    this.employeeFilterSubject.next(event.filter || '');
  }

  protected onEmployeeSelect(option: SelectOption<number>): void {
    if (option) {
      this.form.patchValue({ responsibleId: option.value });
    }
  }

  public validateForm(): boolean {
    this.formSubmitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalidField();
      return false;
    }
    return true;
  }

  private focusFirstInvalidField(): void {
    const el = this.invoiceInputRef()?.nativeElement;
    if (el && this.isFieldInvalid('invoiceNumber')) {
      el.focus();
    }
  }

  public getFormData(): ReceivingHeaderFormData {
    return this.form.getRawValue() as ReceivingHeaderFormData;
  }

  private emitFormState(): void {
    const rawValue = this.form.getRawValue();
    const data: ReceivingHeaderFormData = {
      invoiceNumber: rawValue.invoiceNumber || '',
      supplyAuthorization: rawValue.supplyAuthorization || '',
      totalValue: rawValue.totalValue || 0,
      supplierId: rawValue.supplierId || null,
      responsibleId: rawValue.responsibleId || null,
      receivingDate: rawValue.receivingDate || new Date(),
      observation: rawValue.observation || '',
    };
    this.formChange.emit(data);
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty || this.formSubmitted()));
  }
}
