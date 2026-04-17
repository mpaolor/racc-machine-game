import { Component, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { forkJoin, timer } from 'rxjs';

import { PollinationsService } from '../services/pollinations.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  private aiService = inject(PollinationsService);

  keyInput = signal('');
  isAuthorized = signal(false);

  // reference to the spin button for focus management
  spinButton = viewChild<ElementRef<HTMLButtonElement>>('spinButton');

  // ISO 3166-1 alpha-2 codes
  countries = [
    { code: 'us', name: 'USA' },
    { code: 'it', name: 'Italy' },
    { code: 'jp', name: 'Japan' },
    { code: 'es', name: 'Spain' },
    { code: 'fr', name: 'France' },
    { code: 'gb', name: 'UK' },
    { code: 'mx', name: 'Mexico' },
  ];
  expressions = ['happy', 'cute', 'hungry', 'surprised', 'sleepy'];
  backroundSynonyms = ['landmark', 'monument', 'famous place', 'tourist attraction', 'cityscape'];

  reels = signal<number[]>([0, 1, 2]);
  isSpinning = signal(false);
  message = signal('Press Space or Click to Spin!');

  imgUrl = signal<string | null>(null);
  isLoadingImage = false;

  constructor() {
    // Initial focus so user can play immediately
    afterNextRender(() => {
      this.spinButton()?.nativeElement.focus();
    });
  }

  submitKey() {
    const key = this.keyInput().trim();
    // Basic validation: ensure it's not empty and meets a minimum length
    if (key.length > 20) {
      this.aiService.setApiKey(key);
      this.isAuthorized.set(true);

      // Refocus the button so Spacebar works immediately after entering the key
      setTimeout(() => {
        this.spinButton()?.nativeElement.focus();
      }, 0);
    } else {
      alert('Please enter a valid API Key.');
    }
  }

  spin() {
    if (this.isSpinning()) return;

    this.isSpinning.set(true);
    this.message.set('Spinning...');

    // Determine results immediately (The "Source of Truth")
    const newResults = [
      Math.floor(Math.random() * this.countries.length),
      Math.floor(Math.random() * this.countries.length),
      Math.floor(Math.random() * this.countries.length),
    ];

    // Wait for the "Fake" animation to finish
    setTimeout(() => {
      this.reels.set(newResults);
      this.isSpinning.set(false);
      this.checkWin(newResults);

      // 3. Refocus the button so Spacebar works for the next spin
      setTimeout(() => {
        this.spinButton()?.nativeElement.focus();
      }, 0);
    }, 1200);
  }

  checkWin(results: number[]) {
    // Check if all three symbols are the same
    if (results[0] === results[1] && results[1] === results[2]) {
      this.message.set('You Win! Please wait while we generate your prize...');

      const country = this.countries[results[0]].name;
      const expression = this.expressions[Math.floor(Math.random() * this.expressions.length)];
      const background =
        this.backroundSynonyms[Math.floor(Math.random() * this.backroundSynonyms.length)];
      console.log(`Player won with country: ${country}`);

      const imageRequest$ = this.aiService.getImage(country, expression, background);
      const minDelay$ = timer(1000);

      forkJoin([imageRequest$, minDelay$]).subscribe({
        next: ([blob, _]) => {
          if (blob) {
            const imageUrl = URL.createObjectURL(blob);
            this.imgUrl.set(imageUrl);
          }
        },
        error: (err) => {
          this.message.set('Oops! We could not get your prize.');
          console.error(err);
        },
      });
    } else {
      this.message.set('Try Again!');
    }
  }

  clearImage() {
    if (this.imgUrl()) {
      URL.revokeObjectURL(this.imgUrl()!);
      this.imgUrl.set(null);

      setTimeout(() => {
        this.spinButton()?.nativeElement.focus();
        this.message.set('Press Space or Click to Spin!');
      }, 0);
    }
  }
}
