import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  input,
  model,
  ViewEncapsulation,
} from '@angular/core';
import { DrawerModule } from 'primeng/drawer';

export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule, DrawerModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
})
export class DrawerComponent {
  visible = model<boolean>(false);
  header = input<string>('');
  size = input<DrawerSize>('md');
  position = input<DrawerPosition>('right');

  drawerDimensionClass = computed(() => {
    const pos = this.position();
    const size = this.size();

    if (pos === 'left' || pos === 'right') {
      const widthClasses = {
        sm: 'w-full sm:w-[450px]',
        md: 'w-full md:w-[600px]',
        lg: 'w-full lg:w-[800px]',
        xl: 'w-full xl:w-[1024px]',
        full: 'w-full',
      };
      return widthClasses[size];
    }

    const heightClasses = {
      sm: 'h-[300px] max-h-full dynamic-height',
      md: 'h-[450px] max-h-full dynamic-height',
      lg: 'h-[650px] max-h-full dynamic-height',
      xl: 'h-[850px] max-h-full dynamic-height',
      full: 'h-full',
    };
    return heightClasses[size];
  });
}
