import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Firestore, collection, query, where, getDocs, updateDoc, doc } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-historia',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './historia.component.html',
  styleUrl: './historia.component.scss'
})
export class HistoriaComponent {

  historiasClinicas: any[] = [];  // Lista de historias clínicas
  usuarioDocId: string = ''; // Guardar el ID del documento de usuario


  constructor(private authService: AuthService, private firestore: Firestore) {}

  ngOnInit() {
          this.getHistoriasClinicas();  // Llamar a la función para cargar las historias clínicas
  }

  async getHistoriasClinicas() {
    try {
      const turnosRef = collection(this.firestore, 'turnos'); // Obtener la colección "turnos"
      const q = query(
        turnosRef,
        where('datosPrincipales', '!=', null)  // Filtrar solo los turnos que tengan datosPrincipales
      );

      // Obtener los documentos de la consulta
      const querySnapshot = await getDocs(q);

      this.historiasClinicas = querySnapshot.docs.map(doc => ({
        id: doc.id,
        turno: doc.data()['turno'],
        especialidad: doc.data()['especialidad'],
        especialista: doc.data()['especialista'],
        paciente: doc.data()['paciente'],
        datosPrincipales: doc.data()['datosPrincipales'],
        datosDinamicos: doc.data()['datosDinamicos'],
      }));
    } catch (error) {
      console.error('Error al obtener historias clínicas:', error);
    }
  }

}
