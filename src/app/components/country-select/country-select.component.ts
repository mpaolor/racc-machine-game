import { AppStore, Country } from '../../state/app.store';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FlagsService } from '../../services/flags.service';

@Component({
  selector: 'app-country-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './country-select.component.html',
  styleUrls: ['./country-select.component.css'],
})
export class CountrySelectComponent implements OnInit {
  private flagsService = inject(FlagsService);
  protected store = inject(AppStore);

  // Component-only state
  private allCountries = signal<Country[]>([]);
  protected searchTerm = signal('');

  // Filtering logic stays here in the component
  protected filteredCountries = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.allCountries().filter((c) => c.name.toLowerCase().includes(term));
  });

  ngOnInit() {
    this.flagsService.fetchCountries().subscribe((countries: Country[]) => {
      this.allCountries.set(countries);
    });
  }

  toggleCountry(country: Country) {
    const exists = this.isSelected(country);
    if (exists) {
      this.store.deselectCountry(country);
    } else {
      this.store.selectCountry(country);
    }
  }

  isSelected(country: Country): boolean {
    return this.store.selectedCountries().some((c) => c.code === country.code);
  }

  handleSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
}
