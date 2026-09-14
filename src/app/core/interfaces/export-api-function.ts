import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ExportApiFunction = (searchTerm: string) => Observable<HttpResponse<Blob>>;
