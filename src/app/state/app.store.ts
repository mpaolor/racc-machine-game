import { Injectable, computed, signal } from '@angular/core';

export interface AppState {
  apiKey: string | null;
  isSpinning: boolean;
}

@Injectable({ providedIn: 'root' })
export class AppStore {
  // State constants
  private readonly API_KEY_STORAGE_KEY = 'pollination_api_key';

  // Internal state signal
  private state = signal<AppState>({
    apiKey: localStorage.getItem(this.API_KEY_STORAGE_KEY),
    isSpinning: false,
  });

  // Public Computed Selectors
  readonly isAuthorized = computed(() => !!this.state().apiKey);
  readonly isSpinning = computed(() => this.state().isSpinning);
  readonly apiKey = computed(() => this.state().apiKey);
  // ISO 3166-1 alpha-2 codes
  readonly countries = signal([
    { code: 'us', name: 'USA' },
    { code: 'it', name: 'Italy' },
    { code: 'jp', name: 'Japan' },
    { code: 'es', name: 'Spain' },
    { code: 'fr', name: 'France' },
    { code: 'gb', name: 'UK' },
    { code: 'mx', name: 'Mexico' },
  ]);
  readonly expressions = signal(['happy', 'cute', 'hungry', 'surprised', 'sleepy']);
  readonly backroundSynonyms = signal([
    'landmark',
    'monument',
    'famous place',
    'tourist attraction',
    'cityscape',
  ]);

  // Public actions
  public setApiKey(key: string) {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, key);
    this.state.update((s) => ({ ...s, apiKey: key }));
  }

  public removeApiKey() {
    localStorage.removeItem(this.API_KEY_STORAGE_KEY);
    this.state.update((s) => ({
      ...s,
      apiKey: null,
    }));
  }

  public startSpin() {
    this.state.update((s) => ({
      ...s,
      isSpinning: true,
    }));
  }

  public stopSpin() {
    this.state.update((s) => ({
      ...s,
      isSpinning: false,
    }));
  }
}
