import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Firestore, getDocs, collection, query, where } from '@angular/fire/firestore';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  isLoggedIn = false;
  userEmail!: string;
  usuario: any;

  constructor(public auth: AuthService, private firestore: Firestore){

  }

  ngOnInit()
  {
    this.auth.getUserEmail().subscribe(async (email) => {
      if (email) {
        try {
          this.isLoggedIn = true;
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
        } catch (error) {
          console.error('Error al obtener el usuario o los especialistas:', error);
        }
      }
    });
  }
   

  logout()
  {
    this.auth.logout();
    this.auth.mailUsuario = '';
    this.auth.tipoUsuario = '';
    this.auth.nombreUsuario = '';
    this.isLoggedIn = false;
  }


}
