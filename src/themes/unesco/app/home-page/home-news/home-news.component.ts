import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Add this
import { HomeNewsComponent as BaseComponent } from '../../../../../app/home-page/home-news/home-news.component';

@Component({
  selector: 'ds-themed-home-news',
  styleUrls: ['./home-news.component.scss'],
  // styleUrls: ['../../../../../app/home-page/home-news/home-news.component.scss'],
  templateUrl: './home-news.component.html',
  // templateUrl: '../../../../../app/home-page/home-news/home-news.component.html',
  standalone: true,
  imports: [CommonModule],
})

/**
 * Component to render the news section on the home page
 */
export class HomeNewsComponent implements OnInit {
  slides = [
    {
      image: '/assets/unesco/images/banner1.jpg',
      credit: 'Gregory Piper / Ocean Image Bank'
    },
    {
      image: '/assets/unesco/images/banner2.jpg',
      credit: 'Alex Tyrrell / Ocean Image Bank'
    },
    {
      image: '/assets/unesco/images/banner3.jpg',
      credit: 'Liang Fu / Ocean Image Bank'
    },
    {
      image: '/assets/unesco/images/banner4.jpg',
      credit: 'Jayne Jenkins / Ocean Image Bank'
    }
  ];

  currentSlide = 0;
    private slideshowIntervalId: any;

    ngOnInit(): void {
      this.startAutoPlay();
    }

    ngOnDestroy(): void {
      clearInterval(this.slideshowIntervalId);
    }

    startAutoPlay(): void {
      this.slideshowIntervalId = setInterval(() => {
        this.nextSlide(false); // false: don't reset the timer from auto-play
      }, 3000); // 3 seconds
    }

    nextSlide(resetTimer: boolean = true): void {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
      if (resetTimer) this.resetAutoPlay();
    }

    previousSlide(): void {
      this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
      this.resetAutoPlay();
    }

    resetAutoPlay(): void {
      clearInterval(this.slideshowIntervalId);
      this.startAutoPlay();
    }

    get currentCredit(): string {
      return this.slides[this.currentSlide].credit;
    }
  }
