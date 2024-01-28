import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MasterPageComponent } from './pages/master-page/master-page.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '../app-routing.module';
import { IconsProviderModule } from '../shared/providers/icons-provider.module';
import { NgZorroAntdProviderModule } from '../shared/providers/ng-zorro-antd-provider.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [MasterPageComponent],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    IconsProviderModule,
    NgZorroAntdProviderModule,
    SharedModule,
  ],
  providers: [],
})
export class LayoutModule {}
