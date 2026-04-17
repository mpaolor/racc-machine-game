import { Injectable, computed, signal } from '@angular/core';

// TODO: move to their own files if they grow in complexity
// interfaces and types
export interface Country {
  name: string;
  code: string;
}
export interface AppState {
  apiKey: string | null;
  selectedCountries: Country[];
  isSpinning: boolean;
}

@Injectable({ providedIn: 'root' })
export class AppStore {
  // State constants
  private readonly API_KEY_STORAGE_KEY = 'pollination_api_key';

  // Internal state signal
  private state = signal<AppState>({
    apiKey: localStorage.getItem(this.API_KEY_STORAGE_KEY),
    selectedCountries: [],
    // [
    //   // ISO 3166-1 alpha-2 codes
    //   { code: 'us', name: 'USA' },
    //   { code: 'it', name: 'Italy' },
    //   { code: 'jp', name: 'Japan' },
    //   { code: 'es', name: 'Spain' },
    //   { code: 'fr', name: 'France' },
    //   { code: 'gb', name: 'UK' },
    //   { code: 'mx', name: 'Mexico' },
    // ],
    isSpinning: false,
  });

  // Public Computed Selectors
  readonly isAuthorized = computed(() => !!this.state().apiKey);
  readonly isSpinning = computed(() => this.state().isSpinning);
  readonly apiKey = computed(() => this.state().apiKey);
  readonly selectedCountries = computed(() => this.state().selectedCountries);

  // Public actions
  public setApiKey(key: string) {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, key);
    this.state.update((s) => ({ ...s, apiKey: key }));
  }
  public resetGame() {
    localStorage.removeItem(this.API_KEY_STORAGE_KEY);
    this.state.update((s) => ({
      ...s,
      apiKey: null,
      selectedCountries: [],
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

  public selectCountry(country: Country) {
    if (this.state().selectedCountries.length >= 7) return; // limit to 7 countries for now
    this.state.update((s) => ({
      ...s,
      selectedCountries: [...s.selectedCountries, country],
    }));
  }
  public deselectCountry(country: Country) {
    this.state.update((s) => ({
      ...s,
      selectedCountries: s.selectedCountries.filter((c) => c.code !== country.code),
    }));
  }

  // static data for prompt generation
  readonly expressions = ['happy', 'cute', 'hungry', 'surprised', 'sleepy'];
  readonly backroundSynonyms = [
    'landmark',
    'monument',
    'famous place',
    'tourist attraction',
    'cityscape',
  ];
}
