import { Component, computed, input, model } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';

export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [DrawerModule],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
})
export class DrawerComponent {
  readonly visible = model<boolean>(false);
  readonly header = input<string>('');
  readonly size = input<DrawerSize>('md');
  readonly position = input<DrawerPosition>('right');

  readonly drawerStyleClass = computed(() => {
    const pos = this.position();
    const size = this.size();

    let dimensionClass = '';
    if (pos === 'left' || pos === 'right') {
      const widthClasses: Record<DrawerSize, string> = {
        sm: 'w-full sm:w-[450px]',
        md: 'w-full md:w-[600px]',
        lg: 'w-full lg:w-[800px]',
        xl: 'w-full xl:w-[1024px]',
        full: 'w-full',
      };
      dimensionClass = widthClasses[size];
    } else {
      const heightClasses: Record<DrawerSize, string> = {
        sm: 'h-[300px] max-h-full',
        md: 'h-[450px] max-h-full',
        lg: 'h-[650px] max-h-full',
        xl: 'h-[850px] max-h-full',
        full: 'h-full',
      };
      dimensionClass = heightClasses[size];
    }

    let borderClass = '';
    if (pos === 'right') borderClass = 'border-l';
    if (pos === 'left') borderClass = 'border-r';
    if (pos === 'top') borderClass = 'border-b rounded-b-2xl';
    if (pos === 'bottom') borderClass = 'border-t rounded-t-2xl';

    const containerClasses =
      'bg-zinc-50 dark:bg-zinc-950 shadow-2xl border-zinc-200 dark:border-zinc-800 transition-all duration-300';

    const primeOverrides =
      '[&_.p-drawer-header]:p-5 [&_.p-drawer-header]:bg-zinc-100/50 dark:[&_.p-drawer-header]:bg-zinc-900/40 [&_.p-drawer-header]:border-b [&_.p-drawer-header]:border-zinc-200/80 dark:[&_.p-drawer-header]:border-zinc-800/80 [&_.p-drawer-title]:text-base [&_.p-drawer-title]:font-semibold [&_.p-drawer-title]:text-zinc-900 dark:[&_.p-drawer-title]:text-zinc-100 [&_.p-drawer-content]:p-0';

    return `${dimensionClass} ${containerClasses} ${borderClass} ${primeOverrides}`;
  });
}
