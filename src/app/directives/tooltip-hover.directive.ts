import { Directive, ElementRef, Renderer2, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appTooltipHover]',
  standalone: true
})
export class TooltipHoverDirective {
  private tooltip: HTMLElement | null = null;

  @Input() tooltipMessage: string = ''; // Mensaje dinámico

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onMouseEnter() {
    // Crear el tooltip
    this.tooltip = this.renderer.createElement('span');
    this.renderer.appendChild(this.tooltip, this.renderer.createText(this.tooltipMessage));

    // Estilos básicos para el tooltip
    this.renderer.setStyle(this.tooltip, 'position', 'absolute');
    this.renderer.setStyle(this.tooltip, 'background', '#333');
    this.renderer.setStyle(this.tooltip, 'color', '#fff');
    this.renderer.setStyle(this.tooltip, 'padding', '5px');
    this.renderer.setStyle(this.tooltip, 'border-radius', '5px');
    this.renderer.setStyle(this.tooltip, 'z-index', '1000'); // Para que se muestre sobre otros elementos

    // Agregar el tooltip al DOM
    this.renderer.appendChild(document.body, this.tooltip);
  }

  @HostListener('mousemove', ['$event']) onMouseMove(event: MouseEvent) {
    if (this.tooltip) {
      // Obtener las coordenadas del ratón
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      // Actualizar la posición del tooltip para que esté a la derecha del ratón
      this.renderer.setStyle(this.tooltip, 'top', `${mouseY + 10}px`);
      this.renderer.setStyle(this.tooltip, 'left', `${mouseX + 10}px`);
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (this.tooltip) {
      // Eliminar el tooltip del DOM cuando el ratón salga
      this.renderer.removeChild(document.body, this.tooltip);
    }
  }
}
