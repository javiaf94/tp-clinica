import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './bienvenida.component.html',
  styleUrl: './bienvenida.component.scss'
})
export class BienvenidaComponent {

  constructor(private router: Router) {}

  registrarse()
  {
    this.router.navigate(['registro']);
  }

  iniciarSesion()
  {
    this.router.navigate(['login']);
  }

}
