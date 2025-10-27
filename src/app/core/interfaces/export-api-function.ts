import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

export type ExportApiFunction = (searchTerm: string) => Observable<HttpResponse<Blob>>;
