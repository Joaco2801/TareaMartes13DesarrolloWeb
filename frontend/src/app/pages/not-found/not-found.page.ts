import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-not-found',
  styleUrl: './not-found.page.css',
  templateUrl: './not-found.page.html',
})
export class NotFoundPage {
  //Acá nuestro código. Dentro de la clase.
}

export default NotFoundPage;
