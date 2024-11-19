import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Firestore, collection, query, where, getDocs, addDoc, updateDoc, doc  } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { trigger, transition, style, animate } from '@angular/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.scss',

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
            turno.turno.toLowerCase().includes(filtroLower) ||
            (turno.datosPrincipales && turno.datosPrincipales.join(' ').toLowerCase().includes(filtroLower)) ||  // Convertir a string
            (turno.datosDinamicos && JSON.stringify(turno.datosDinamicos).toLowerCase().includes(filtroLower)) ||  // Convertir objeto a string
            turno.estado?.toLowerCase().includes(filtroLower) ||
            turno.comentario_cancelacion?.toLowerCase().includes(filtroLower) ||
            turno.comentario_rechazo?.toLowerCase().includes(filtroLower) ||
            turno.resena?.toLowerCase().includes(filtroLower) 
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
            turno.turno.toLowerCase().includes(filtroLower) ||
            (turno.datosPrincipales && turno.datosPrincipales.join(' ').toLowerCase().includes(filtroLower)) ||  // Convertir a string
            (turno.datosDinamicos && JSON.stringify(turno.datosDinamicos).toLowerCase().includes(filtroLower)) ||  // Convertir objeto a string
            turno.estado?.toLowerCase().includes(filtroLower) ||
            turno.comentario_cancelacion?.toLowerCase().includes(filtroLower) ||
            turno.comentario_rechazo?.toLowerCase().includes(filtroLower) ||
            turno.calificacion?.toLowerCase().includes(filtroLower) 
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

  altura: string = '';
  peso: string = '';
  temperatura: string = '';
  presion: string = '';
  datosDinamicos: { clave: string, valor: string }[] = [];

  async cargarHistoriaClinica(turno: any) {
    try {
      const result = await Swal.fire({
        title: 'Ingrese la historia clínica',
        width: '600px',
        html: `
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            <div style="flex: 1 1 calc(50% - 10px);">
              <label for="altura" style="display: block; margin-bottom: 5px;">Altura</label>
              <input id="altura" class="swal2-input" placeholder="Altura (cm)" style="width: 100%; height: 28px;">
            </div>
            <div style="flex: 1 1 calc(50% - 10px);">
              <label for="peso" style="display: block; margin-bottom: 5px;">Peso</label>
              <input id="peso" class="swal2-input" placeholder="Peso (kg)" style="width: 100%; height: 28px;">
            </div>
            <div style="flex: 1 1 calc(50% - 10px);">
              <label for="temperatura" style="display: block; margin-bottom: 5px;">Temperatura</label>
              <input id="temperatura" class="swal2-input" placeholder="Temperatura (°C)" style="width: 100%; height: 28px;">
            </div>
            <div style="flex: 1 1 calc(50% - 10px);">
              <label for="presion" style="display: block; margin-bottom: 5px;">Presión</label>
              <input id="presion" class="swal2-input" placeholder="Presión (mmHg)" style="width: 100%; height: 28px;">
            </div>
          </div>
          <div style="margin-top: 20px;">
            <div style="display: flex; gap: 10px;">
              <div style="flex: 1;">
                <label for="clave1" style="display: block; margin-bottom: 5px;">Clave 1</label>
                <input id="clave1" class="swal2-input" placeholder="Clave 1" style="width: 100%; height: 28px;">
              </div>
              <div style="flex: 1;">
                <label for="valor1" style="display: block; margin-bottom: 5px;">Valor 1</label>
                <input id="valor1" class="swal2-input" placeholder="Valor 1" style="width: 100%; height: 28px;">
              </div>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
              <div style="flex: 1;">
                <label for="clave2" style="display: block; margin-bottom: 5px;">Clave 2</label>
                <input id="clave2" class="swal2-input" placeholder="Clave 2" style="width: 100%; height: 28px;">
              </div>
              <div style="flex: 1;">
                <label for="valor2" style="display: block; margin-bottom: 5px;">Valor 2</label>
                <input id="valor2" class="swal2-input" placeholder="Valor 2" style="width: 100%; height: 28px;">
              </div>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
              <div style="flex: 1;">
                <label for="clave3" style="display: block; margin-bottom: 5px;">Clave 3</label>
                <input id="clave3" class="swal2-input" placeholder="Clave 3" style="width: 100%; height: 28px;">
              </div>
              <div style="flex: 1;">
                <label for="valor3" style="display: block; margin-bottom: 5px;">Valor 3</label>
                <input id="valor3" class="swal2-input" placeholder="Valor 3" style="width: 100%; height: 28px;">
              </div>
            </div>
          </div>
        `,
        focusConfirm: false,
        preConfirm: () => {
          const altura = (document.getElementById('altura') as HTMLInputElement).value;
          const peso = (document.getElementById('peso') as HTMLInputElement).value;
          const temperatura = (document.getElementById('temperatura') as HTMLInputElement).value;
          const presion = (document.getElementById('presion') as HTMLInputElement).value;

          const clave1 = (document.getElementById('clave1') as HTMLInputElement).value;
          const valor1 = (document.getElementById('valor1') as HTMLInputElement).value;
          const clave2 = (document.getElementById('clave2') as HTMLInputElement).value;
          const valor2 = (document.getElementById('valor2') as HTMLInputElement).value;
          const clave3 = (document.getElementById('clave3') as HTMLInputElement).value;
          const valor3 = (document.getElementById('valor3') as HTMLInputElement).value;

          const datosDinamicos: { [key: string]: string } = {};
          if (clave1 && valor1) datosDinamicos[clave1] = valor1;
          if (clave2 && valor2) datosDinamicos[clave2] = valor2;
          if (clave3 && valor3) datosDinamicos[clave3] = valor3;

          return {
            datosPrincipales: [altura, peso, temperatura, presion],
            datosDinamicos
          };
        }
      });

      if (result.isConfirmed && result.value) {
        const turnoRef = doc(this.firestore, 'turnos', turno.id);
        await updateDoc(turnoRef, {
          datosPrincipales: result.value.datosPrincipales,
          datosDinamicos: result.value.datosDinamicos
        });

        // Actualizar el objeto localmente
        turno.datosPrincipales = result.value.datosPrincipales;
        turno.datosDinamicos = result.value.datosDinamicos;

        console.log('Datos guardados en Firestore y actualizados localmente');
      } else {
        console.log('Operación cancelada');
      }
    } catch (error) {
      console.error('Error al guardar los datos en Firestore:', error);
    }
  }

  async verHistoriaClinica(turno: any) {
    if (turno.datosPrincipales || turno.datosDinamicos) {
      // Obtener los datos principales y asignar etiquetas
      const etiquetasPrincipales = ['Altura', 'Peso', 'Temperatura', 'Presión'];
      const datosPrincipales = turno.datosPrincipales || [];
  
      // Crear HTML para mostrar los datos principales
      let htmlPrincipales = '<div><h3>Datos Principales</h3><ul>';
      datosPrincipales.forEach((dato: string, index: number) => {
        htmlPrincipales += `<li><strong>${etiquetasPrincipales[index]}:</strong> ${dato || 'N/A'}</li>`;
      });
      htmlPrincipales += '</ul></div>';
  
      // Crear HTML para mostrar los datos dinámicos
      const datosDinamicos = turno.datosDinamicos || {};
      let htmlDinamicos = '<div style="margin-top: 20px;"><h3>Datos Adicionales</h3>';
      if (Object.keys(datosDinamicos).length > 0) {
        htmlDinamicos += '<ul>';
        for (const [clave, valor] of Object.entries(datosDinamicos)) {
          htmlDinamicos += `<li><strong>${clave}:</strong> ${valor}</li>`;
        }
        htmlDinamicos += '</ul>';
      } else {
        htmlDinamicos += '<p>No hay datos adicionales.</p>';
      }
      htmlDinamicos += '</div>';
  
      // Mostrar SweetAlert con los datos
      Swal.fire({
        title: 'Historia Clínica',
        html: htmlPrincipales + htmlDinamicos,
        icon: 'info',
        confirmButtonText: 'Cerrar',
        width: '600px'
      });
    } else {
      // Mostrar alerta si no hay historia clínica
      Swal.fire({
        title: 'Sin Historia Clínica',
        text: 'Este turno no tiene historia clínica registrada.',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
    }
  }
}
