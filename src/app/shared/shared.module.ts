import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AboutComponent } from './pages/about/about.component';



@NgModule({
  declarations: [
    SidebarComponent,
    NotFoundComponent,
    AboutComponent
  ],
  imports: [
    CommonModule
  ]
})
export class SharedModule { }
