import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoTurno',
  standalone: true
})
export class EstadoTurnoPipe implements PipeTransform {

  transform(estado: string): string {
    const estados: { [key: string]: string } = {
      aceptado: 'Aceptado 👍',
      pendiente: 'Pendiente ⏳',
      confirmado: 'Confirmado ✅',
      cancelado: 'Cancelado ❌',
      finalizado: 'Finalizado 🏁',
      rechazado: 'Rechazado 🚫'
    };
    return estados[estado.toLowerCase()] || 'Estado desconocido';
  }
}