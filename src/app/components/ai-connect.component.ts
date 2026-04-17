import { Component, inject } from '@angular/core';

import { AppStore } from '../state/app.store';

@Component({
  selector: 'app-ai-connect',
  standalone: true,
  templateUrl: './ai-connect.component.html',
  styleUrls: ['./ai-connect.component.css'],
})
export class AiConnectComponent {
  public store = inject(AppStore);

  public submitKey(inputValue?: string) {
    const key = inputValue ? inputValue.trim() : '';
    // Basic validation: ensure it's not empty and meets a minimum length
    if (key.length > 20) {
      this.store.setApiKey(key);
    } else {
      alert('Please enter a valid API Key.');
    }
  }
}
