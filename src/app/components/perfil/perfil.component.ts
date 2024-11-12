import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Firestore, collection, query, where, getDocs, updateDoc, doc } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent {
  usuario: any;
  usuarioDocId: string = ''; // Guardar el ID del documento de usuario
  selectedEspecialidad: string = '';
  selectedDia: string = '';
  inicioHora: string = '';
  finHora: string = '';
  duracionTurno: number = 0; // Nuevo campo para la duración del turno
  franjasHorarias: { especialidad: string; dia: string; inicio: string; fin: string }[] = [];

  diasDeLaSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  constructor(private authService: AuthService, private firestore: Firestore) {}

  ngOnInit() {
    this.authService.getUserEmail().subscribe(async (email) => {
      if (email) {
        try {
          const usuariosRef = collection(this.firestore, 'usuarios');
          const q = query(usuariosRef, where('email', '==', email));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            this.usuario = doc.data();
            this.usuarioDocId = doc.id; // Guardar el ID del documento
            this.franjasHorarias = this.usuario.horarios || []; // Cargar horarios existentes
            this.duracionTurno = this.usuario.duracionTurno || 0; // Cargar la duración del turno
  
            // Asignar el primer valor de especialidades a selectedEspecialidad
            if (this.usuario.especialidades && this.usuario.especialidades.length > 0) {
              this.selectedEspecialidad = this.usuario.especialidades[0];
            }
          });
  
          if (!this.usuario) {
            console.log('Usuario no encontrado');
          }
        } catch (error) {
          console.error('Error al obtener el usuario:', error);
        }
      }
    });
  }

  async agregarFranjaHoraria() {
    if (this.selectedEspecialidad && this.selectedDia && this.inicioHora && this.finHora) {
      const inicio = new Date(`1970-01-01T${this.inicioHora}:00`);
      const fin = new Date(`1970-01-01T${this.finHora}:00`);
      const duracionMinutos = (fin.getTime() - inicio.getTime()) / (1000 * 60);

      
      const inicioHoraPermitido = new Date(`1970-01-01T08:00:00`);
      const finHoraPermitidoSemana = new Date(`1970-01-01T19:00:00`);
      const finHoraPermitidoSabado = new Date(`1970-01-01T14:00:00`);
      const esSabado = this.selectedDia.toLowerCase() === 'sábado';
      const finHoraMaxPermitido = esSabado ? finHoraPermitidoSabado : finHoraPermitidoSemana;
      
      if (inicio < inicioHoraPermitido || fin > finHoraMaxPermitido) {
        Swal.fire( { title: 'Error!',
          text: `Los horarios deben estar entre las 08:00 y las ${esSabado ? '14:00' : '19:00'}.`,
          icon: 'error',
          confirmButtonColor: '#4CAF50',
          background: '#f2f2f2',
          heightAuto: false
        }); 
        return;
      }
      
      if (fin <= inicio) {
        Swal.fire( { title: 'Error!',
          text: `La hora de fin debe ser mayor a la hora de inicio.`,
          icon: 'error',
          confirmButtonColor: '#4CAF50',
          background: '#f2f2f2',
          heightAuto: false
        }); 
        return;
      }

      if (duracionMinutos < this.duracionTurno) {
        Swal.fire( { title: 'Error!',
          text: `La franja horaria debe ser de al menos ${this.duracionTurno} minutos.`,
          icon: 'error',
          confirmButtonColor: '#4CAF50',
          background: '#f2f2f2',
          heightAuto: false
        }); 
        return;
      }

      const colisiona = this.franjasHorarias.some(franja =>
        franja.dia === this.selectedDia &&
        (
          (inicio >= new Date(`1970-01-01T${franja.inicio}:00`) && inicio < new Date(`1970-01-01T${franja.fin}:00`)) ||
          (fin > new Date(`1970-01-01T${franja.inicio}:00`) && fin <= new Date(`1970-01-01T${franja.fin}:00`)) ||
          (inicio <= new Date(`1970-01-01T${franja.inicio}:00`) && fin >= new Date(`1970-01-01T${franja.fin}:00`))
        )
      );

      if (colisiona) {
        Swal.fire( { title: 'Error!',
          text: 'La franja horaria colisiona con otra ya ingresada.',
          icon: 'error',
          confirmButtonColor: '#4CAF50',
          background: '#f2f2f2',
          heightAuto: false
        }); 
        return;
      }

      this.franjasHorarias.push({
        especialidad: this.selectedEspecialidad,
        dia: this.selectedDia,
        inicio: this.inicioHora,
        fin: this.finHora
      });

      this.selectedDia = '';
      this.inicioHora = '';
      this.finHora = '';

      // Guardar en Firebase
      await this.actualizarHorariosYDuracionEnFirebase();
    } else {
      Swal.fire( { title: 'Error!',
        text: 'Por favor, complete todos los campos antes de agregar la franja horaria.',
        icon: 'error',
        confirmButtonColor: '#4CAF50',
        background: '#f2f2f2',
        heightAuto: false
      }); 
    }
  }

  async eliminarFranja(index: number) {
    this.franjasHorarias.splice(index, 1);
    await this.actualizarHorariosYDuracionEnFirebase();
  }

  async actualizarHorariosYDuracionEnFirebase() {
    if (this.usuarioDocId) {
      try {
        const userDocRef = doc(this.firestore, 'usuarios', this.usuarioDocId);
        await updateDoc(userDocRef, {
          horarios: this.franjasHorarias,
          duracionTurno: this.duracionTurno // Guardar la duración del turno
        });
        console.log('Horarios y duración del turno actualizados en Firebase.');
      } catch (error) {
        console.error('Error al actualizar los horarios y la duración en Firebase:', error);
      }
    }
  }

  async actualizarDuracionEnFirebase()
  {
    if (this.usuarioDocId) {
      try {
        const userDocRef = doc(this.firestore, 'usuarios', this.usuarioDocId);
        await updateDoc(userDocRef, {
          duracionTurno: this.usuario.duracionTurno // Guardar la duración del turno
        });
        console.log('Horarios y duración del turno actualizados en Firebase.');
      } catch (error) {
        console.error('Error al actualizar los horarios y la duración en Firebase:', error);
      }
    }
  }
}
