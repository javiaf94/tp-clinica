import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Firestore, collection, query, where, getDocs, updateDoc, doc } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { trigger, transition, style, animate } from '@angular/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.scss',
  animations: [
    // Animación para hacer que el componente entre desde la izquierda
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('500ms ease-out', style({ transform: 'translateX(0)' }))
      ])
    ]),
    // Animación para los turnos, haciendo que se expandan uno por uno
    trigger('turnoExpand', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.5)' }),
        animate('500ms 100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})

export class PacientesComponent {

  historiasClinicas: any[] = [];  // Lista de historias clínicas
  usuario: any;
  usuarioDocId: string = ''; // Guardar el ID del documento de usuario


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
            });
  
          if (!this.usuario) {
            console.log('Usuario no encontrado');
          }

          this.getHistoriasClinicas();  // Llamar a la función para cargar las historias clínicas

        } catch (error) {
          console.error('Error al obtener el usuario:', error);
        }
      }
    });
  }

  async getHistoriasClinicas() {
    try {
      const emailEspecialista = this.usuario.email;  // Obtener el email del usuario
      const turnosRef = collection(this.firestore, 'turnos'); // Obtener la colección "turnos"
      const q = query(
        turnosRef,
        where('emailEspecialista', '==', emailEspecialista),  // Filtrar por el email del paciente
        where('datosPrincipales', '!=', null)  // Filtrar solo los turnos que tengan datosPrincipales
      );

      // Obtener los documentos de la consulta
      const querySnapshot = await getDocs(q);

      this.historiasClinicas = querySnapshot.docs.map(doc => ({
        id: doc.id,
        turno: doc.data()['turno'],
        especialidad: doc.data()['especialidad'],
        paciente: doc.data()['paciente'],
        datosPrincipales: doc.data()['datosPrincipales'],
        datosDinamicos: doc.data()['datosDinamicos'],
      }));
    } catch (error) {
      console.error('Error al obtener historias clínicas:', error);
    }
  }
}
