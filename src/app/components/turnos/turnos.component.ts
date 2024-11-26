import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Firestore, collection, query, where, getDocs, addDoc, updateDoc, doc  } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { trigger, transition, style, animate } from '@angular/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TurnoEstadoColorDirective } from '../../directives/turno-estado-color.directive';
import { CapitalizeFirstLetterPipe } from '../../pipes/capitalize-nombres';
import { EstadoTurnoPipe } from '../../pipes/estado-turno.pipe';


@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, TurnoEstadoColorDirective, CapitalizeFirstLetterPipe, EstadoTurnoPipe],
  templateUrl: './turnos.component.html',
  styleUrl: './turnos.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.3s', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('0.5s ease-out', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({ transform: 'translateX(-100%)' }))
      ])
    ]),
    trigger('expand', [
      transition(':enter', [
        style({ transform: 'scale(0.9)', opacity: 0 }),
        animate('0.3s ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.2s ease-in', style({ transform: 'scale(0.9)', opacity: 0 }))
      ])
    ]),
    trigger('staggerExpand', [
      transition(':enter', [
        animate('0.5s 0.1s ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
  
})
export class TurnosComponent {

  usuario: any;

  turnos: any = '';
  turnosFiltrados: any[] = []; // Definimos turnosFiltrados como un array de cualquier tipo


  // Campo de filtro
  filtro: string = '';

  constructor(private auth: AuthService, private firestore: Firestore) {}

  

    // Función para filtrar los turnos
    filtrarTurnos() {
      if (!this.filtro) {
        this.turnosFiltrados = [...this.turnos];
      } else {
        this.turnosFiltrados = this.turnos.filter((turno: any) => {
          const filtroLower = this.filtro.toLowerCase();
          return (
            turno.especialidad.toLowerCase().includes(filtroLower) ||
            turno.especialista.toLowerCase().includes(filtroLower) ||
            turno.turno.toLowerCase().includes(filtroLower)
          );
        });
      }
    
      // Llamar a la función de ordenamiento
      this.ordenarTurnosDesc();
    }

    ordenarTurnosDesc() {
      this.turnosFiltrados.sort((a: any, b: any) => {
        // Suponiendo que turno.turno es una cadena de texto o fecha
        if (a.turno > b.turno) {
          return -1;
        } else if (a.turno < b.turno) {
          return 1;
        }
        return 0;
      });
    }


  ngOnInit()
  {
    this.auth.getUserEmail().subscribe(async (email) => {
      if (email) {
        try {
          // Obtener el usuario actual
          const usuariosRef = collection(this.firestore, 'usuarios');
          const q = query(usuariosRef, where('email', '==', email));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            this.usuario = doc.data();
          });

          if (!this.usuario) {
            console.log('Usuario no encontrado');
          }

          if(this.usuario.tipo == 'admin')
          {
            const turnosRef = collection(this.firestore, 'turnos');
            const turnosQuery = query(turnosRef);
            const turnosSnaphsot = await getDocs(turnosQuery);
            this.turnos = [];
            turnosSnaphsot.forEach((doc) => {
              this.turnos.push({ id: doc.id, ...doc.data() });
            });
          }
        } catch (error) {
          console.error('Error al obtener el usuario o los especialistas:', error);
        }

        this.turnosFiltrados = [...this.turnos];
        this.ordenarTurnosDesc();
      }
    });
  }

  //especialista
  async aceptarTurno(turno: any) {
    try {
      // Obtener la referencia del documento del turno
      const turnoRef = doc(this.firestore, 'turnos', turno.id);
      // Actualizar el estado del turno en Firebase
      await updateDoc(turnoRef, {
        estado: 'aceptado'
      });
      console.log('Turno aceptado con éxito');
      // Actualizar la lista de turnos localmente si es necesario
      turno.estado = 'aceptado';
    } catch (error) {
      console.error('Error al aceptar el turno:', error);
    }
  }

  async cancelarTurno(turno: any) {
    try {
      const { value: comentario } = await Swal.fire({
        title: 'Cancelar Turno',
        input: 'text',
        inputLabel: 'Motivo de la cancelación',
        inputPlaceholder: 'Escribe el motivo de la cancelación',
        showCancelButton: true,
        confirmButtonText: 'Cancelar Turno',
        cancelButtonText: 'Volver',
        inputValidator: (value) => {
          if (!value) {
            return '¡Debes ingresar un motivo!';
          }
          return undefined; // Agregar esto para evitar el error
        }
      });
  
      // Si el usuario ingresó un comentario y confirmó, proceder con la cancelación
      if (comentario) {
        // Obtener la referencia del documento del turno
        const turnoRef = doc(this.firestore, 'turnos', turno.id);
        
        // Actualizar el estado y el comentario de cancelación en Firebase
        await updateDoc(turnoRef, {
          estado: 'cancelado',
          comentario_cancelacion: comentario
        });
  
        console.log('Turno cancelado con éxito');
        
        // Actualizar la lista de turnos localmente si es necesario
        turno.estado = 'cancelado';
        turno.comentario_cancelacion = comentario;
      } else {
        console.log('Cancelación del turno anulada');
      }
    } catch (error) {
      console.error('Error al cancelar el turno:', error);
    }
  }

  async calificarAtencion(turno:any){
    try {
      const { value: comentario } = await Swal.fire({
        title: 'Calificar atención',
        input: 'text',
        inputLabel: 'Califique la atención del especialista',
        inputPlaceholder: 'Escriba algún comentario acerca de la atención',
        showCancelButton: true,
        confirmButtonText: 'Calificar',
        cancelButtonText: 'Volver',
        inputValidator: (value) => {
          if (!value) {
            return '¡Debes ingresar un motivo!';
          }
          return undefined; // Agregar esto para evitar el error
        }
      });
  
      // Si el usuario ingresó un comentario y confirmó, proceder con la cancelación
      if (comentario) {
        // Obtener la referencia del documento del turno
        const turnoRef = doc(this.firestore, 'turnos', turno.id);
        
        // Actualizar el estado y el comentario de cancelación en Firebase
        await updateDoc(turnoRef, {
          calificacion: comentario
        });
  
        console.log('Turno calificado con éxito');
        
        // Actualizar la lista de turnos localmente si es necesario
        turno.calificacion = comentario;
      } else {
        console.log('calificacion del turno anulada');
      }
    } catch (error) {
      console.error('Error al calificar el turno:', error);
    }
  }

 
   
  async rechazarTurno(turno:any)
  {
    try {
      const { value: comentario } = await Swal.fire({
        title: 'Rechazar Turno',
        input: 'text',
        inputLabel: 'Motivo del Rechazo',
        inputPlaceholder: 'Escribe el motivo del Rechazo',
        showCancelButton: true,
        confirmButtonText: 'Rechazar Turno',
        cancelButtonText: 'Volver',
        inputValidator: (value) => {
          if (!value) {
            return '¡Debes ingresar un motivo!';
          }
          return undefined; // Agregar esto para evitar el error
        }
      });
  
      // Si el usuario ingresó un comentario y confirmó, proceder con la cancelación
      if (comentario) {
        // Obtener la referencia del documento del turno
        const turnoRef = doc(this.firestore, 'turnos', turno.id);
        
        // Actualizar el estado y el comentario de cancelación en Firebase
        await updateDoc(turnoRef, {
          estado: 'rechazado',
          comentario_rechazo: comentario
        });
  
        console.log('Turno rechazado con éxito');
        
        // Actualizar la lista de turnos localmente si es necesario
        turno.estado = 'rechazado';
        turno.comentario_rechazo = comentario;
      } else {
        console.log('Rechazo del turno anulada');
      }
    } catch (error) {
      console.error('Error al Rechazar el turno:', error);
    }
   }

  async finalizarTurno(turno:any)
  {
    try {
      const { value: comentario } = await Swal.fire({
        title: 'Finalizar Turno',
        input: 'text',
        inputLabel: 'Diagnóstico y reseña de la consulta',
        inputPlaceholder: 'Ingrese el diagnóstico y/o reseña de la consulta',
        showCancelButton: true,
        confirmButtonText: 'Finalizar Turno',
        cancelButtonText: 'Volver',
        inputValidator: (value) => {
          if (!value) {
            return '¡Debes ingresar un motivo!';
          }
          return undefined; // Agregar esto para evitar el error
        }
      });
  
      // Si el usuario ingresó un comentario y confirmó, proceder con la cancelación
      if (comentario) {
        // Obtener la referencia del documento del turno
        const turnoRef = doc(this.firestore, 'turnos', turno.id);
        
        // Actualizar el estado y el comentario de cancelación en Firebase
        await updateDoc(turnoRef, {
          estado: 'finalizado',
          resena: comentario
        });
  
        console.log('Turno finalizado con éxito');
        
        // Actualizar la lista de turnos localmente si es necesario
        turno.estado = 'finalizado';
        turno.resena = comentario;
      } else {
        console.log('Finalizacion del turno anulada');
      }
    } catch (error) {
      console.error('Error al Finalizar el turno:', error);
    }
  }

  async verResena(turno: any) {
    if (turno.resena) {
      Swal.fire({
        title: 'Reseña del Turno',
        text: turno.resena,
        icon: 'info',
        confirmButtonText: 'Cerrar'
      });
    } else {
      Swal.fire({
        title: 'Sin Reseña',
        text: 'Este turno no tiene una reseña ingresada.',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
    }
  }

  async verCalificacion(turno: any) {
    if (turno.calificacion) {
      Swal.fire({
        title: 'Calificacion del Paciente',
        text: turno.calificacion,
        icon: 'info',
        confirmButtonText: 'Cerrar'
      });
    } else {
      Swal.fire({
        title: 'Sin Calificación',
        text: 'Este turno no tiene una calificación ingresada.',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
    }
  }

}
