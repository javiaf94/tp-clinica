import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Firestore, collection, query, where, getDocs, updateDoc, doc } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import { trigger, transition, style, animate } from '@angular/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
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
    ])
  ]
  
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

  historiasClinicas: any[] = [];  // Lista de historias clínicas


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

          this.getHistoriasClinicas();  // Llamar a la función para cargar las historias clínicas

        } catch (error) {
          console.error('Error al obtener el usuario:', error);
        }
      }
    });
  }

  async getHistoriasClinicas() {
    try {
      const emailPaciente = this.usuario.email;  // Obtener el email del usuario
      const turnosRef = collection(this.firestore, 'turnos'); // Obtener la colección "turnos"
      const q = query(
        turnosRef,
        where('emailPaciente', '==', emailPaciente),  // Filtrar por el email del paciente
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

  downloadPDF() {
    const doc = new jsPDF();
  
    // Cargar la imagen (asegúrate de que esté en base64 o usa un path accesible)
    const img = 'icon_circle.png'; // Reemplaza esto con la ruta real de tu imagen
  
    // Agregar la imagen en la parte superior y centrarla
    doc.addImage(img, 'PNG', 80, 10, 50, 50); // Ajusta las coordenadas y el tamaño según sea necesario
  
    // Título centrado debajo de la imagen
    doc.setFontSize(16);
    const pageWidth = doc.internal.pageSize.getWidth();
    const title = 'Historias Clínicas de Pacientes';
    const textWidth = doc.getTextWidth(title);
    const textX = (pageWidth - textWidth) / 2;
    doc.text(title, textX, 70); // Ajusta la coordenada Y según el tamaño de la imagen
  
    // Fecha actual centrada y más pequeña
    const today = new Date().toLocaleDateString();
    doc.setFontSize(10);
    const dateWidth = doc.getTextWidth(today);
    const dateX = (pageWidth - dateWidth) / 2;
    doc.text(today, dateX, 75); // Ajusta la coordenada Y para la fecha debajo del título
    
    // Obtener el valor de paciente desde la primera historia clínica (si se desea poner una vez)
    const paciente = this.historiasClinicas[0].paciente;
    doc.setFontSize(12);
    const pacienteText = `Paciente: ${paciente}`;
    const pacienteWidth = doc.getTextWidth(pacienteText);
    const pacienteX = (pageWidth - pacienteWidth) / 2;
    doc.text(pacienteText, pacienteX, 80); // Ajusta la coordenada Y para el paciente debajo de la fecha

    let yPosition = 90; // Iniciar después del título, fecha y paciente
  
    // Iterar sobre las historias clínicas
    this.historiasClinicas.forEach((historia, index) => {
      doc.setFontSize(12);
  
      // Imprimir cada campo en una línea separada
      doc.text(`Turno: ${historia.turno.split(',')[0]}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Especialidad: ${historia.especialidad}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Especialista: ${historia.especialista}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Altura: ${historia.datosPrincipales[0]} cm`, 20, yPosition);
      yPosition += 10;
      doc.text(`Peso: ${historia.datosPrincipales[1]} kg`, 20, yPosition);
      yPosition += 10;
      doc.text(`Temperatura: ${historia.datosPrincipales[2]} °C`, 20, yPosition);
      yPosition += 10;
      doc.text(`Presión: ${historia.datosPrincipales[3]}`, 20, yPosition);
      yPosition += 10;
  
      // Agregar los valores dinámicos si existen
      if (historia.datosDinamicos) {
        const dynamicData = historia.datosDinamicos instanceof Map
          ? historia.datosDinamicos
          : new Map(Object.entries(historia.datosDinamicos));
  
        dynamicData.forEach((value: string, key: string) => {
          doc.text(`${key}: ${value}`, 20, yPosition);
          yPosition += 10;
        });
      }
  
      // Agregar una línea horizontal centrada entre historias clínicas
      if (index < this.historiasClinicas.length - 1) {
        yPosition -= 5; // Subir la línea un renglón antes de lo previsto
        const lineStartX = pageWidth * 0.2; // 20% del ancho de la página
        const lineEndX = pageWidth * 0.8; // 80% del ancho de la página
        doc.setLineWidth(0.5);
        doc.line(lineStartX, yPosition, lineEndX, yPosition);
        yPosition += 15; // Espacio después de la línea para la próxima historia
      }
  
      // Saltar de página si el contenido es largo
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20; // Resetear la posición Y para una nueva página
      }
    });
  
    // Descargar el PDF
    doc.save('historias_clinicas.pdf');
}

  
  
  
  
}
