import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'edad',
  standalone: true
})
export class EdadPipe implements PipeTransform {

  transform(value: number): string {
    if (isNaN(value) || value < 0) {
      return 'Edad no válida'; 
    }

    return `${value} años`;
  }
}
