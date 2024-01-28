import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AboutComponent } from './pages/about/about.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '../app-routing.module';
import { IconsProviderModule } from './providers/icons-provider.module';
import { NgZorroAntdProviderModule } from './providers/ng-zorro-antd-provider.module';
import { NavbarComponent } from './components/navbar/navbar.component';

@NgModule({
  declarations: [
    SidebarComponent,
    NotFoundComponent,
    AboutComponent,
    NavbarComponent,
  ],
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
  ],
  exports: [SidebarComponent, NavbarComponent],
})
export class SharedModule {}
