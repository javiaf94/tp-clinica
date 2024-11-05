import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Firestore, collection, getDocs, updateDoc, doc } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AltaComponent } from './alta/alta.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AltaComponent],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent {

  activeTab: string = 'alta';
  usuarios: any[] = []; // Variable para almacenar los usuarios
  usuariosFiltrados: any[] = [];     // Lista de usuarios filtrados según el tipo seleccionado
  selectedUserType: string = 'especialista'; // Tipo de usuario seleccionado en el filtro

  constructor(private firestore: Firestore)
  {

  }

  async ngOnInit() {
    await this.obtenerUsuarios();
    this.filterUsers() 
  }

  async obtenerUsuarios() {
    const col = collection(this.firestore, 'usuarios'); // Asegúrate que 'usuarios' sea el nombre correcto de la colección
    const querySnapshot = await getDocs(col);
    this.usuarios = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  filterUsers() 
  {
    this.usuariosFiltrados = this.usuarios.filter(user => user.tipo === this.selectedUserType);
  }

  async toggleEstado(usuario: any, event: Event) {
    const nuevoEstado = (event.target as HTMLInputElement).checked ? 'aprobado' : 'pendiente';
    
    try {
      // Referencia al documento del usuario en la base de datos
      const userRef = doc(this.firestore, `usuarios/${usuario.id}`);
      
      // Actualización del estado en la base de datos
      await updateDoc(userRef, { estado: nuevoEstado });
      
      // Actualiza el valor localmente para evitar recargar la lista
      usuario.estado = nuevoEstado;
      
      console.log(`Usuario ${usuario.nombre} actualizado a estado: ${nuevoEstado}`);
    } catch (error) {
      console.error('Error actualizando el estado:', error);
    }
  }
}
