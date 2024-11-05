import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

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


  constructor(public auth: AuthService){

  }

  ngOnInit()
  {
    this.auth.isLoggedIn().pipe(
      map(user => ({
        loggedIn: !!user, // Convert user object to boolean (true/false)
        email: user ? user.email : null // Retrieve user email if logged in
      }))
    ).subscribe(({ loggedIn, email }) => {
      this.isLoggedIn = loggedIn; // Update isLoggedIn flag
      this.userEmail = email; // Update userEmail attribute
    });
  }
   

  logout()
  {
    this.auth.logout();
    this.auth.mailUsuario = '';
    this.auth.tipoUsuario = '';
    this.auth.nombreUsuario = '';
  }

}
