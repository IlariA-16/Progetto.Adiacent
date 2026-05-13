import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import routeConfig from './app/routes';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';

// Creiamo un caricatore "fatto in casa" che non dà errori di Injector
export class CustomLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}
  getTranslation(lang: string): Observable<any> {
    return this.http.get(`./assets/language/${lang}.json`);
  }
}

export function CustomLoaderFactory(http: HttpClient) {
  return new CustomLoader(http);
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routeConfig),
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: CustomLoaderFactory,
          deps: [HttpClient]
        }
      })
    )
  ]
}).catch(err => console.error(err));