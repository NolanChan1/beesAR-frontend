import { Component, OnInit } from '@angular/core';
import { CurrentSelectionService } from '../current-selection.service';

@Component({
  selector: 'product-menu',
  templateUrl: './product-menu.component.html',
  styleUrls: ['./product-menu.component.css'],
})
export class ProductMenuComponent implements OnInit {
  dropdownOptions = [
    { name: 'Default product menu', icon: 'book-open' },
    { name: 'Search for products by category', icon: 'category-outline' },
    { name: 'Search for products by name', icon: 'search-outline' },
  ];
  public currentMenu = this.dropdownOptions[0];

  similarProducts = [
    {
      name: '3″ Solid Beeswax Pillar Candle',
      imageFP: 'assets/images/similar-candle1.png',
    },
    {
      name: 'Rolled Mini Pillar Beeswax Candle',
      imageFP: 'assets/images/similar-candle2.png',
    },
    {
      name: 'Bee Necklace Beeswax Treasure Candle',
      imageFP: 'assets/images/similar-candle3.png',
    },
    {
      name: 'Mini Pillar Advent Candle Set',
      imageFP: 'assets/images/similar-candle4.png',
    },
  ];

  specialtyCandles = [
    {
      name: 'Mason Jar Beeswax Candle',
      imageFP: 'assets/images/specialty-candle1.png',
    },
    {
      name: 'Natural Beeswax Dipped Birthday Candles',
      imageFP: 'assets/images/specialty-candle2.png',
    },
    {
      name: 'Chakra Treasure Beeswax Votive Candle',
      imageFP: 'assets/images/specialty-candle3.png',
    },
    {
      name: 'Rolled Beeswax Birthday Candles',
      imageFP: 'assets/images/specialty-candle4.png',
    },
  ];

  constructor(public currentSelection: CurrentSelectionService) {}

  ngOnInit(): void {}

  public dropdownValueChanged(event: any) {
    this.currentMenu = event;
  }
}
