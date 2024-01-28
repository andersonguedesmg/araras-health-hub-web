import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { pt_BR } from 'ng-zorro-antd/i18n';

import { LayoutModule } from './layout/layout.module';
import { ModulesModule } from './modules/modules.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LayoutModule,
    ModulesModule,
    SharedModule,
  ],
  providers: [
    { provide: NZ_I18N, useValue: pt_BR }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
