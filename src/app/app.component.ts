import { Component, ElementRef, afterNextRender, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // Get the reference to the button using the signal-based viewChild
  spinButton = viewChild<ElementRef<HTMLButtonElement>>('spinbutton');

  symbols = ['🍒', '🍋', '💎', '7️⃣', '🔔', '🍇'];
  symbolHeight = 100;
  
  reels = signal([
    { offset: 0, finalResult: 0 },
    { offset: 0, finalResult: 0 },
    { offset: 0, finalResult: 0 }
  ]);
  
  isSpinning = signal(false);
  message = signal('Good Luck!');

  constructor() {
    // This runs only once, after the app is rendered in the browser
    afterNextRender(() => {
      this.focusSpinButton();
    });
  }

  focusSpinButton() {
    this.spinButton()?.nativeElement.focus();
  }

  spin() {
    if (this.isSpinning()) return;

    this.isSpinning.set(true);
    this.message.set('Spinning...');

    this.reels.update(currentReels => 
       currentReels.map((reel, index) => {
        const selectedSymbolIndex = Math.floor(Math.random() * this.symbols.length);
        
        // DISTANCE MATH:
        // We take the current offset and add a massive "jump" to it.
        // This ensures the wheel always travels at least 15-25 full rotations.
        const minRotationDistance = (15 + (index * 5)) * this.symbols.length * this.symbolHeight;
        const extraDistance = selectedSymbolIndex * this.symbolHeight;
        
        // The new offset must also account for the current position so it lands correctly
        const currentPositionInCycle = reel.offset % (this.symbols.length * this.symbolHeight);
        const distanceToMove = minRotationDistance + extraDistance - currentPositionInCycle;

        return {
          finalResult: selectedSymbolIndex,
          offset: reel.offset + distanceToMove
        };
      })
    );

    setTimeout(() => {
      this.isSpinning.set(false);
      this.checkWin();

      // to ensure the button is focused after the spin animation completes, we use another timeout
      setTimeout(() => {
        this.focusSpinButton();
      }, 1);
    }, 1050); 
  }

  checkWin() {
    const results = this.reels().map(r => r.finalResult);
    if (results.every(val => val === results[0])) {
      this.message.set('💰 BIG WIN! 💰');
    } else {
      this.message.set('Try Again!');
    }
  }
}