import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { forkJoin, timer } from 'rxjs';

import { AiConnectComponent } from './components/ai-connect.component';
import { AppStore } from './state/app.store';
import { CountrySelectComponent } from './components/country-select.component';
import { PollinationsService } from '../services/pollinations.service';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [AiConnectComponent, CountrySelectComponent],
})
export class AppComponent {
  private aiService = inject(PollinationsService);
  public store = inject(AppStore);

  // dom references
  // reference to the spin button for focus management
  spinButton = viewChild<ElementRef<HTMLButtonElement>>('spinbutton');

  // signals
  reels = signal<number[]>([0, 1, 2]);
  message = signal('Press Space or Click to Spin!');
  imgUrl = signal<string | null>(null);
  isLoadingImage = signal(false);

  constructor() {
    // 2. The effect runs whenever the signals inside it change
    effect(() => {
      const isAuth = this.store.isAuthorized();
      const button = this.spinButton();

      // If we are authorized and the button has appeared in the DOM
      if (isAuth && button) {
        // Use a tiny timeout or requestAnimationFrame to ensure the
        // browser has finished painting the new UI before focusing
        requestAnimationFrame(() => {
          console.log('Focusing spin button after authorization');
          button.nativeElement.focus();
        });
      }
    });
  }

  public spin() {
    if (this.store.isSpinning()) return;

    this.store.startSpin();
    this.message.set('Spinning...');

    // Determine results immediately (The "Source of Truth")
    const newResults = [
      Math.floor(Math.random() * this.store.selectedCountries().length),
      Math.floor(Math.random() * this.store.selectedCountries().length),
      Math.floor(Math.random() * this.store.selectedCountries().length),
    ];

    // Wait for the "Fake" animation to finish
    setTimeout(() => {
      this.reels.set(newResults);
      this.store.stopSpin();
      this.checkWin(newResults);

      // Refocus the button so Spacebar works for the next spin
      setTimeout(() => {
        this.spinButton()?.nativeElement.focus();
      }, 1);
    }, 1200);
  }

  private launchConfetti() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 }, // Left side
        colors: ['#a2d2ff', '#4895ef', '#ffffff'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 }, // Right side
        colors: ['#a2d2ff', '#4895ef', '#ffffff'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }

  private checkWin(results: number[]) {
    // Check if all three symbols are the same
    if (results[0] === results[1] && results[1] === results[2]) {
      this.launchConfetti();

      this.message.set('You Win! Please wait while we generate your prize...');

      this.isLoadingImage.set(true);

      const country = this.store.selectedCountries()[results[0]].name;

      const imageRequest$ = this.aiService.getImage(country);
      const minDelay$ = timer(1000);

      forkJoin([imageRequest$, minDelay$]).subscribe({
        next: ([blob, _]) => {
          if (blob) {
            const imageUrl = URL.createObjectURL(blob);
            this.imgUrl.set(imageUrl);
          }
          this.isLoadingImage.set(false);
        },
        error: (err) => {
          this.message.set('Oops! We could not get your prize.');
          console.error(err);
          this.isLoadingImage.set(false);
        },
      });
    } else {
      this.message.set('Try Again!');
    }
  }

  public clearImage() {
    if (this.imgUrl()) {
      URL.revokeObjectURL(this.imgUrl()!);
      this.imgUrl.set(null);

      // reset countries
      this.store.changeCountries();
    }
  }
}
