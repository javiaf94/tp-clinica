import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTurnoEstadoColor]',
  standalone: true
})
export class TurnoEstadoColorDirective {
  @Input() set appTurnoEstadoColor(estado: string) {
    this.setColorByEstado(estado);
  }

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  private setColorByEstado(estado: string) {
    // Cambiar el color de fondo según el estado del turno
    switch (estado) {
      case 'finalizado':
        this.renderer.setStyle(this.el.nativeElement, 'background-color', '#c8e6c9'); // Verde claro
        break;
      case 'aceptado':
        this.renderer.setStyle(this.el.nativeElement, 'background-color', '#fff9c4'); // Amarillo claro
        break;
      case 'cancelado':
        this.renderer.setStyle(this.el.nativeElement, 'background-color', '#ffccbc'); // Naranja claro
        break;
      case 'rechazado':
        this.renderer.setStyle(this.el.nativeElement, 'background-color', '#ffcdd2'); // Rojo claro
        break;
      case 'pendiente':
        this.renderer.setStyle(this.el.nativeElement, 'background-color', '#b3e5fc'); // Celeste claro
        break;
      default:
        this.renderer.setStyle(this.el.nativeElement, 'background-color', '#ffffff'); // Blanco por defecto
        break;
    }
  }
}
