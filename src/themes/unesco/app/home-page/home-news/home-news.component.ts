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
      image: '/assets/unesco/images/home-news/banner1.webp',
      credit: 'Gregory Piper / Ocean Image Bank',
      link: 'https://www.theoceanagency.org/search-result?img=YHc69BMAACMArtvv'
    },
    {
      image: '/assets/unesco/images/home-news/banner2.webp',
      credit: 'Alex Tyrrell / Ocean Image Bank',
      link: 'https://www.theoceanagency.org/search-result?img=YEgD9BEAACIAqMSi'
    },
    {
      image: '/assets/unesco/images/home-news/banner3.webp',
      credit: 'Liang Fu / Ocean Image Bank',
      link: 'https://www.theoceanagency.org/search-result?img=YGXmIBMAACAAYN4S'
    },
    {
      image: '/assets/unesco/images/home-news/banner4.webp',
      credit: 'Jayne Jenkins / Ocean Image Bank',
      link: 'https://www.theoceanagency.org/search-result?img=YHTveRMAACAApIuf'
    },
    {
      image: '/assets/unesco/images/home-news/banner5.webp',
      credit: 'Ocean Image Bank',
      link: 'https://www.theoceanagency.org/search-result?img=YGD5KhIAACAAmO_q'
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
      }, 10000); // 10 seconds
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
