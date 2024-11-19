import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Firestore, collection, getDocs, updateDoc, doc } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AltaComponent } from './alta/alta.component';
import { SpinnerComponent } from '../spinner/spinner.component';
import { HistoriaComponent } from './historia/historia.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AltaComponent, SpinnerComponent, HistoriaComponent],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss',
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
    trigger('slideInFromTop', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', opacity: 0 }),
        animate('0.5s ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
  
})
export class UsuariosComponent {

  activeTab: string = 'listado';
  usuarios: any[] = []; // Variable para almacenar los usuarios
  usuariosFiltrados: any[] = [];     // Lista de usuarios filtrados según el tipo seleccionado
  selectedUserType: string = 'especialista'; // Tipo de usuario seleccionado en el filtro


  loading: boolean = false;

  constructor(private firestore: Firestore)
  {

  }

  async ngOnInit() {
    await this.obtenerUsuarios();
    this.filterUsers() 
  }

  async obtenerUsuarios() {
    this.loading = true;
    const col = collection(this.firestore, 'usuarios'); // Asegúrate que 'usuarios' sea el nombre correcto de la colección
    const querySnapshot = await getDocs(col);
    this.usuarios = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    this.loading = false;
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
