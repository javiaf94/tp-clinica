import { Routes } from '@angular/router';
import { BienvenidaComponent } from './components/bienvenida/bienvenida.component';
import { RegistroComponent } from './components/registro/registro.component';
import { LoginComponent } from './components/login/login.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { authGuardAdmin } from './guards/auth.guardAdmin';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
    { path: '', redirectTo: '/bienvenida', pathMatch: "full" },
    { path: 'bienvenida', component: BienvenidaComponent},
    { path: 'registro', component: RegistroComponent},
    { path: 'login', component: LoginComponent},
    { path: 'perfil', component: PerfilComponent, canActivate: [authGuard]},
    { path: 'usuarios', component: UsuariosComponent, canActivate: [authGuardAdmin]},
    { path: '**', redirectTo: '/bienvenida', pathMatch: "full"},

];