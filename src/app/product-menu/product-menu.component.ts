import { Component, OnInit } from '@angular/core';

import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';

import { ProductMenuExpandedCardComponent } from '../product-menu-expanded-card/product-menu-expanded-card.component';
import { CurrentSelectionService } from '../current-selection.service';
import { candleCategories } from './candle-categories';

@Component({
  selector: 'product-menu',
  templateUrl: './product-menu.component.html',
  styleUrls: ['./product-menu.component.css'],
})
export class ProductMenuComponent implements OnInit {
  dropdownOptions = [
    { id: 1, name: 'Default product menu', icon: 'book-open' },
    {
      id: 2,
      name: 'Search for products by category',
      icon: 'category-outline',
    },
    { id: 3, name: 'Search for products by name', icon: 'search-outline' },
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

  productCategories = candleCategories;
  public currentSearchTerm: string = '';
  public empty: boolean = true;

  constructor(
    private expandedProductCard: MatDialog,
    private productMenuRef: MatBottomSheetRef<ProductMenuComponent>,
    public currentSelection: CurrentSelectionService
  ) {}

  ngOnInit(): void {}

  public openExpandedProductCard(id: number) {
    this.expandedProductCard.open(ProductMenuExpandedCardComponent, {
      backdropClass: 'custom-dialog-backdrop',
      panelClass: 'custom-dialog-container',
      maxWidth: '92vw',
      width: '92vw',
    });
  }

  public dropdownValueChanged(event: any) {
    this.currentMenu = event;
  }

  public toggleProductCategory(id: number) {
    if (id == 0) {
      if (!this.productCategories[0].selected) {
        // Select "All" and unselect the other buttons
        this.productCategories[0].selected = true;
        for (let i = 1; i < this.productCategories.length; i++) {
          this.productCategories[i].selected = false;
        }
      } else {
        this.productCategories[0].selected = false;
      }
    } else {
      // Unselect "All" if a different category is selected
      if (this.productCategories[0].selected) {
        this.productCategories[0].selected = false;
      }

      this.productCategories[id].selected =
        !this.productCategories[id].selected;
    }
  }

  public setSearchTerm(newVal: string) {
    this.currentSearchTerm = newVal;
  }

  public clearSearchTerm() {
    this.currentSearchTerm = '';
  }

  public performSearch() {
    this.empty = !this.empty;
  }

  public closeProductMenu() {
    this.productMenuRef.dismiss();
  }
}
