import { Injectable, inject } from '@angular/core';
import { Observable, catchError, firstValueFrom, map, of, retry } from 'rxjs';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PixazoService {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://gateway.pixazo.ai/inpainting/v1/getImage';
  private readonly API_KEY = '';
  private readonly PROMPT =
    'Create a raccoon with the face resembling the image I gave you. The raccon should have a happy expression, have a cartoon style, and the environment should be somewhere famous in {country}';

  // FROM THE DOCUMENTATION:
  // fetch(url, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Cache-Control': 'no-cache',
  //     'Ocp-Apim-Subscription-Key': 'YOUR_SUBSCRIPTION_KEY'
  //   },
  //   body: JSON.stringify(data)
  // })
  // .then(response => response.json())
  // .then(data => console.log(data))
  // .catch(error => console.error('Error:', error));

  public getImage(country: string, originalImgUrl: string): Observable<string> {
    const payload = {
      prompt: this.PROMPT.replace('{country}', country),
      imageUrl: originalImgUrl,
      maskUrl: '',
      negative_prompt: 'watermark',
      height: 1024,
      width: 1024,
      num_steps: 20,
      guidance: 5,
      seed: 42,
    };

    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Ocp-Apim-Subscription-Key': this.API_KEY,
    };

    return this.http.post<{ imageUrl: string }>(this.API_URL, payload, { headers }).pipe(
      retry(2),
      map((response) => {
        console.log('Raw Server Response:', response);
        return response.imageUrl;
      }),
      catchError((err) => {
        console.error('Logging failed', err);
        return of('');
      }),
    );
  }
}
