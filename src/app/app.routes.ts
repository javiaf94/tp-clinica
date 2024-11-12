import { Routes } from '@angular/router';
import { BienvenidaComponent } from './components/bienvenida/bienvenida.component';
import { RegistroComponent } from './components/registro/registro.component';
import { LoginComponent } from './components/login/login.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { authGuardAdmin } from './guards/auth.guardAdmin';
import { authGuard } from './guards/auth.guard';
import { SolicitarTurnoComponent } from './components/solicitar-turno/solicitar-turno.component';
import { authGuardPacienteAdmin } from './guards/auth.guardPacienteAdministrador';
import { MisTurnosComponent } from './components/mis-turnos/mis-turnos.component';

export const routes: Routes = [
    { path: '', redirectTo: '/bienvenida', pathMatch: "full" },
    { path: 'bienvenida', component: BienvenidaComponent},
    { path: 'registro', component: RegistroComponent},
    { path: 'login', component: LoginComponent},
    { path: 'perfil', component: PerfilComponent, canActivate: [authGuard]},
    { path: 'usuarios', component: UsuariosComponent, canActivate: [authGuardAdmin]},
    { path: 'solicitar-turno', component: SolicitarTurnoComponent},
    { path: 'mis-turnos', component: MisTurnosComponent},

    { path: '**', redirectTo: '/bienvenida', pathMatch: "full"},

];