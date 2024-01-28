import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '../app-routing.module';
import { IconsProviderModule } from '../shared/providers/icons-provider.module';
import { NgZorroAntdProviderModule } from '../shared/providers/ng-zorro-antd-provider.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    IconsProviderModule,
    NgZorroAntdProviderModule,
  ]
})
export class ModulesModule { }
