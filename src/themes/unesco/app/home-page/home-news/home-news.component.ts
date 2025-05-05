import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
export class HomeNewsComponent {
  bannerCredit = {
    credit: 'Gregory Piper / Ocean Image Bank',
    link: 'https://www.theoceanagency.org/search-result?img=YHc69BMAACMArtvv'
  };
}
