import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Firestore, collection, query, where, getDocs, addDoc, updateDoc, doc  } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.scss'
})
export class MisTurnosComponent {

  usuario: any;

  turnosPaciente: any = '';
  turnosFiltradosPaciente: any[] = []; // Definimos turnosFiltradosPaciente como un array de cualquier tipo

  turnosEspecialista: any = '';
  turnosFiltradosEspecialista: any[] = []; // Definimos turnosFiltradosPaciente como un array de cualquier tipo
  // Campo de filtro
  filtro: string = '';

  constructor(private auth: AuthService, private firestore: Firestore) {}

  

    // Función para filtrar los turnosPaciente
    filtrarTurnosPaciente() {
      if (!this.filtro) {
        this.turnosFiltradosPaciente = [...this.turnosPaciente];
      } else {
        this.turnosFiltradosPaciente = this.turnosPaciente.filter((turno: any) => {  
          const filtroLower = this.filtro.toLowerCase();
          return (
            turno.especialidad.toLowerCase().includes(filtroLower) ||
            turno.especialista.toLowerCase().includes(filtroLower) ||
            turno.turno.toLowerCase().includes(filtroLower)
          );
        });
      }
    }

    filtrarTurnosEspecialista() {
      if (!this.filtro) {
        this.turnosFiltradosEspecialista = [...this.turnosEspecialista];
      } else {
        this.turnosFiltradosEspecialista = this.turnosEspecialista.filter((turno: any) => {  
          const filtroLower = this.filtro.toLowerCase();
          return (
            turno.especialidad.toLowerCase().includes(filtroLower) ||
            turno.paciente.toLowerCase().includes(filtroLower) ||
            turno.turno.toLowerCase().includes(filtroLower)
          );
        });
      }
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
          if(this.usuario.tipo =='paciente')
          {
            const turnosRef = collection(this.firestore, 'turnos');
            const turnosQuery = query(turnosRef, where('emailPaciente', '==', email));
            const turnosSnaphsot = await getDocs(turnosQuery);
            this.turnosPaciente = [];
            turnosSnaphsot.forEach((doc) => {
              this.turnosPaciente.push({ id: doc.id, ...doc.data() });
            });
          }

          if(this.usuario.tipo =='especialista')
            {
              const turnosRef = collection(this.firestore, 'turnos');
              const turnosQuery = query(turnosRef, where('emailEspecialista', '==', email));
              const turnosSnaphsot = await getDocs(turnosQuery);
              this.turnosEspecialista = [];
              turnosSnaphsot.forEach((doc) => {
                this.turnosEspecialista.push({ id: doc.id, ...doc.data() });
              });
            }
        } catch (error) {
          console.error('Error al obtener el usuario o los especialistas:', error);
        }

        this.turnosFiltradosPaciente = [...this.turnosPaciente];
        this.turnosFiltradosEspecialista = [...this.turnosEspecialista];

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
