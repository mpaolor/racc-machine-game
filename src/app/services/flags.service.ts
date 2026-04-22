import { AppStore, Country } from '../state/app.store';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FlagsService {
  private http = inject(HttpClient);
  private store = inject(AppStore);

  private readonly API_URL = 'https://flagcdn.com/en/codes.json';

  public fetchCountries(): Observable<Country[]> {
    return this.http.get<Record<string, string>>(this.API_URL).pipe(
      map((data: Record<string, string>) => {
        return (
          Object.entries(data)
            .map(([code, name]) => ({ name, code }))
            // Clean out non-country codes
            .filter((c) => !c.code.includes('us-') && c.code !== 'il')
        );
      }),
    );
  }
}
