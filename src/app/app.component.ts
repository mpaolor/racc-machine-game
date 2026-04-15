import { Component, ElementRef, afterNextRender, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  spinButton = viewChild<ElementRef<HTMLButtonElement>>('spinButton');
  
  symbols = ['🍒', '🍋', '🍇', '🍊', '🔔', '💎'];
  // Stores the index of the symbol shown in each of the 3 reels
  reels = signal<number[]>([0, 1, 2]); 
  isSpinning = signal(false);
  message = signal('Press Space or Click to Spin!');

  constructor() {
    // Initial focus so user can play immediately
    afterNextRender(() => {
      this.spinButton()?.nativeElement.focus();
    });
  }

  spin() {
    if (this.isSpinning()) return;

    this.isSpinning.set(true);
    this.message.set('Spinning...');

    // 1. Determine results immediately (The "Source of Truth")
    const newResults = [
      Math.floor(Math.random() * this.symbols.length),
      Math.floor(Math.random() * this.symbols.length),
      Math.floor(Math.random() * this.symbols.length)
    ];

    // 2. Wait for the "Fake" animation to finish
    setTimeout(() => {
      this.reels.set(newResults);
      this.isSpinning.set(false);
      this.checkWin(newResults);

      // 3. Refocus the button so Spacebar works for the next spin
      setTimeout(() => {
        this.spinButton()?.nativeElement.focus();
      }, 0);
    }, 1200); // This duration matches the feel of the spin
  }

  checkWin(results: number[]) {
    // Check if all three symbols are the same
    if (results[0] === results[1] && results[1] === results[2]) {
      this.message.set('💰 BIG WIN! 💰');
    } else {
      this.message.set('Try Again!');
    }
  }
}