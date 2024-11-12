import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Firestore, collection, query, where, getDocs, addDoc } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './solicitar-turno.component.html',
  styleUrls: ['./solicitar-turno.component.scss']
})
export class SolicitarTurnoComponent {

  usuario: any;
  usuarioDocId: string = ''; // Guardar el ID del documento de usuario
  especialistas: any[] = []; // Lista para almacenar los especialistas
  especialidadesDisponibles: string[] = []; // Lista para almacenar las especialidades únicas
  especialistasFiltrados: any[] = []; // Lista para almacenar los especialistas filtrados por especialidad seleccionada
  selectedEspecialidad: string = ''; // Especialidad seleccionada
  selectedEspecialista: string = ''; // Especialista seleccionado
  selectedTurno: string = ''; // Turno seleccionado
  turnosDisponibles: string[] = []; // Lista para almacenar los turnos disponibles

  constructor(private authService: AuthService, private firestore: Firestore, private router: Router) {}

  ngOnInit() {
    this.authService.getUserEmail().subscribe(async (email) => {
      if (email) {
        try {
          // Obtener el usuario actual
          const usuariosRef = collection(this.firestore, 'usuarios');
          const q = query(usuariosRef, where('email', '==', email));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            this.usuario = doc.data();
            this.usuarioDocId = doc.id; // Guardar el ID del documento
          });

          if (!this.usuario) {
            console.log('Usuario no encontrado');
          }

          // Obtener todos los usuarios cuyo tipo sea 'especialista'
          const especialistasQuery = query(usuariosRef, where('tipo', '==', 'especialista'));
          const especialistasSnapshot = await getDocs(especialistasQuery);
          this.especialistas = [];
          especialistasSnapshot.forEach((doc) => {
            this.especialistas.push(doc.data());
          });

          if (this.especialistas.length === 0) {
            console.log('No se encontraron especialistas');
          }

          // Obtener todas las especialidades y eliminamos duplicados
          this.especialidadesDisponibles = this.especialistas
            .flatMap((especialista) => especialista.especialidades) // Obtener todas las especialidades de los especialistas
            .filter((value, index, self) => self.indexOf(value) === index); // Filtrar para eliminar duplicados

          if(this.usuario.tipo == 'admin')
          {
            const pacientesQuery = query(usuariosRef, where('tipo', '==', 'paciente'));
            const pacientesSnapshot = await getDocs(pacientesQuery);
            this.pacientes = [];
            pacientesSnapshot.forEach((doc) => {
              this.pacientes.push(doc.data());
            });
          }
        } catch (error) {
          console.error('Error al obtener el usuario o los especialistas:', error);
        }
      }
    });
  }

  // Función para filtrar los especialistas según la especialidad seleccionada
  filtrarEspecialistasPorEspecialidad() {
    if (this.selectedEspecialidad) {
      this.especialistasFiltrados = this.especialistas.filter((especialista) =>
        especialista.especialidades.includes(this.selectedEspecialidad)
      );
    } else {
      this.especialistasFiltrados = [];
    }
  }

  // Función para obtener los turnos disponibles del especialista seleccionado
  async obtenerTurnosDisponibles() {
    const especialista = this.especialistasFiltrados.find(
      (especialista) => especialista.email === this.selectedEspecialista
    );
  
    if (especialista) {
      const agenda = especialista.horarios || []; // La agenda del especialista
      this.turnosDisponibles = []; // Limpiar los turnos previos
  
      // Calcular las fechas límite: hoy y dentro de dos semanas
      const hoy = new Date();
      const fechaLimite = new Date();
      fechaLimite.setDate(hoy.getDate() + 14); // Dos semanas a partir de hoy
  
      // Obtener los turnos ya reservados para el especialista
      const turnosRef = collection(this.firestore, 'turnos');
      const turnosQuery = query(turnosRef, where('emailEspecialista', '==', this.selectedEspecialista));
      const turnosSnapshot = await getDocs(turnosQuery);
      const turnosReservados = new Set<string>();
  
      turnosSnapshot.forEach((doc) => {
        const turno = doc.data()['turno'];
        turnosReservados.add(turno); // Guardar los turnos ya reservados
      });
  
      agenda.forEach((franja: any) => { // Usamos 'any' para evitar el error de tipo
        if (franja.especialidad === this.selectedEspecialidad) {
          // Obtener el día de la semana (en formato textual)
          const diaSemana = franja.dia;
  
          // Crear un objeto Date para la fecha del turno (día de la semana + hora)
          let fechaTurno = this.obtenerFechaParaDia(diaSemana, hoy);
  
          // Si la fecha del turno está después de la fecha límite, no continuar
          if (fechaTurno > fechaLimite) {
            return;
          }
  
          const inicio = new Date(`1970-01-01T${franja.inicio}:00`); // Convertir inicio a formato de hora
          const fin = new Date(`1970-01-01T${franja.fin}:00`); // Convertir fin a formato de hora
          const duracionTurno = especialista.duracionTurno || 30; // Aseguramos que usemos la duración del especialista
  
          let horaActual = inicio;
          while (horaActual < fin) {
            let finTurno = new Date(horaActual.getTime() + duracionTurno * 60000); // Agregar duración del turno
            if (finTurno <= fin) {
              const turno = `${fechaTurno.toLocaleDateString('es-ES')}, ${horaActual.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${finTurno.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
              
              // Verificar si el turno ya está reservado
              if (!turnosReservados.has(turno)) {
                // Guardar el turno original
                this.turnosDisponibles.push(turno); 
              }
                // Duplicar el turno sumando 7 días
                let fechaDuplicada = new Date(fechaTurno);
                fechaDuplicada.setDate(fechaDuplicada.getDate() + 7);
  
                const turno_duplicado = `${fechaDuplicada.toLocaleDateString('es-ES')}, ${horaActual.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${finTurno.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                if (!turnosReservados.has(turno_duplicado)) 
                {
                  // Guardar el turno duplicado
                  this.turnosDisponibles.push(turno_duplicado);
                }
              
            }
            horaActual = finTurno; // Avanzar al siguiente turno
          }
        }
      });
  
      // Ordenar los turnos disponibles
      this.turnosDisponibles.sort((a, b) => {
        const [fechaA, horaA] = a.split(', ');
        const [fechaB, horaB] = b.split(', ');
  
        const partesFechaA = fechaA.split(' ')[0].split('/').map(Number);
        const partesFechaB = fechaB.split(' ')[0].split('/').map(Number);
  
        // Crear objetos Date solo con la fecha (día/mes/año)
        const dateA = new Date(partesFechaA[2], partesFechaA[1] - 1, partesFechaA[0]);
        const dateB = new Date(partesFechaB[2], partesFechaB[1] - 1, partesFechaB[0]);
  
        // Comparar las fechas primero
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
  
        // Si las fechas son iguales, comparar las horas
        return horaA.localeCompare(horaB);
      });
  
      console.log('Turnos Disponibles:', this.turnosDisponibles);
    }
  }
  
  
  
  // Función para obtener la fecha del próximo día de la semana, ahora considerando también la próxima semana
  obtenerFechaParaDia(diaSemana: string, fechaBase: Date): Date {
    const diasDeLaSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    let diaIndex = diasDeLaSemana.indexOf(diaSemana.toLowerCase());
  
    // Obtener el día actual
    const hoy = new Date(fechaBase);
    const diaActual = hoy.getDay();
  
    console.log(`Hoy es ${diasDeLaSemana[diaActual]}, buscando ${diaSemana}`);
  
    // Si el día de la semana ya pasó, sumar los días necesarios para llegar al siguiente
    let diasHastaElDia = diaIndex - diaActual;
  
    console.log(`Días hasta ${diaSemana}: ${diasHastaElDia}`);
  
    // Si el día ya pasó esta semana, avanzar a la siguiente semana
    if (diasHastaElDia <= 0) {
      diasHastaElDia += 7; // Avanzar a la próxima semana si ya pasó este día
      console.log(`El día ya pasó esta semana, avanzando a la próxima semana.`);
    }
  
    // Crear la fecha del siguiente día de la semana (si ya pasó este día esta semana, nos movemos a la próxima semana)
    hoy.setDate(hoy.getDate() + diasHastaElDia);
  
    // Ahora, si la fecha calculada es **hoy** o un **día posterior**, debemos asegurarnos que caiga dentro de las dos semanas.
    // Poner la hora en 00:00 para evitar problemas con las comparaciones de fecha
    hoy.setHours(0, 0, 0, 0);
  
    // Si la fecha calculada ya pasó el límite, avanzar a la próxima semana
    const fechaLimite = new Date();
    fechaLimite.setDate(hoy.getDate() + 14); // Dos semanas a partir de hoy
    if (hoy > fechaLimite) {
      hoy.setDate(hoy.getDate() + 7); // Moverse a la siguiente semana si la fecha ya está fuera del rango
    }
  
    console.log(`Fecha calculada para el próximo ${diaSemana}: ${hoy.toLocaleDateString('es-ES')}`);
    return hoy;
  }
  
  
  
  async guardarTurno() {
    if (this.selectedTurno  && this.selectedEspecialista) {
      try {
        const emailPaciente = this.selectedPaciente ? this.selectedPaciente : this.usuario.email;

        const paciente = this.selectedPaciente ?  this.pacientes.find( (paciente:any) => paciente.email === this.selectedPaciente ).nombre + ' ' + this.pacientes.find( (paciente:any) => paciente.email === this.selectedPaciente ).apellido : (this.usuario.nombre + ' ' + this.usuario.apellido);

        const especialista = this.especialistasFiltrados.find(
          (especialista) => especialista.email === this.selectedEspecialista
        );

        const turnoRef = collection(this.firestore, 'turnos');
        await addDoc(turnoRef, {
          emailPaciente: emailPaciente,
          paciente: paciente,
          emailEspecialista: this.selectedEspecialista,
          especialista: especialista.nombre + ' ' + especialista.apellido,
          turno: this.selectedTurno,
          especialidad: this.selectedEspecialidad,
          estado: 'pendiente'
        });
              
       const msjUsuario =  !this.selectedPaciente ? ' Podrá ver su turno desde la sección mis turnos.' : '';
        
        Swal.fire( { title: 'Turno guardado!',
          text: 'El turno fue guardado con éxito.' + msjUsuario,
          icon: 'success',
          confirmButtonText: 'Entiendo',
          heightAuto: false,
        });   

        this.selectedPaciente ? this.router.navigate(['usuarios']) :  this.router.navigate(['mis-turnos']);


        // Puedes agregar algún mensaje de confirmación o redirigir a otra página si es necesario
      } catch (error) {
        console.error('Error al guardar el turno:', error);
      }
    } else {
      console.log('Faltan datos para guardar el turno');
    }
  }


  selectedPaciente:any = null;
  pacientes: any = null;

  seleccionarPaciente()
  {
  }
}
