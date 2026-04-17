import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, firstValueFrom, from, map, of, retry } from 'rxjs';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PollinationsService {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://gen.pollinations.ai/image';
  private readonly PROMPT =
    'Create a cartoon styled raccoon with a {expression} expression and a {background} from {country}';
  // use a signal to store the key so the service is reactive
  private apiKey = signal<string | null>(null);

  public setApiKey(key: string) {
    this.apiKey.set(key);
  }

  public getImage(
    country: string,
    expression: string,
    background: string,
  ): Observable<Blob | null> {
    const key = this.apiKey();
    if (!key) throw new Error('API Key missing!');

    const prompt = this.PROMPT.replace('{country}', country)
      .replace('{expression}', expression)
      .replace('{background}', background);
    const url = `${this.API_URL}/${encodeURIComponent(prompt)}?model=flux&key=${this.apiKey()}`;

    return this.http.get(url, { responseType: 'blob' }).pipe(
      map((response: Blob) => {
        return response;
      }),
    );
  }
}
