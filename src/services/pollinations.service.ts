import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, firstValueFrom, from, map, of, retry } from 'rxjs';

import { AppStore } from '../app/state/app.store';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PollinationsService {
  private http = inject(HttpClient);
  private store = inject(AppStore);

  private readonly API_URL = 'https://gen.pollinations.ai/image';
  private readonly PROMPT =
    'Create a cartoon styled raccoon with a {expression} expression and a {background} from {country}';

  public getImage(country: string): Observable<Blob | null> {
    const key = this.store.apiKey();
    if (!key) throw new Error('API Key missing!');

    const expression =
      this.store.expressions[Math.floor(Math.random() * this.store.expressions.length)];
    const background =
      this.store.backroundSynonyms[
        Math.floor(Math.random() * this.store.backroundSynonyms.length)
      ];

    const prompt = this.PROMPT.replace('{country}', country)
      .replace('{expression}', expression)
      .replace('{background}', background);
    const url = `${this.API_URL}/${encodeURIComponent(prompt)}?model=flux&key=${key}`;

    return this.http.get(url, { responseType: 'blob' }).pipe(
      map((response: Blob) => {
        return response;
      }),
    );
  }
}
