import { Component, OnInit, ElementRef } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-product-menu-expanded-card',
  templateUrl: './product-menu-expanded-card.component.html',
  styleUrls: ['./product-menu-expanded-card.component.css'],
})
export class ProductMenuExpandedCardComponent implements OnInit {
  public colourOptions: any[] = [
    { id: 1, name: 'Banana', value: '#b28839' },
    { id: 2, name: 'Stuart Gold', value: '#be8f32' },
    { id: 3, name: 'Peach', value: '#bd8e58' },
    { id: 4, name: 'Cloud 9', value: '#a2906b' },
    { id: 5, name: 'Fern', value: '#565827' },
    { id: 6, name: 'Rosy Blush', value: '#c66c6f' },
    { id: 7, name: 'Root Beer', value: '#6c5649' },
  ];
  public selectedColourID: number;
  public selectedColourName: string;

  public heightOptions: any[] = [
    { id: 1, name: '3"' },
    { id: 2, name: '5"' },
    { id: 3, name: '7"' },
    { id: 4, name: '9"' },
  ];
  public selectedHeightID: number;
  public selectedHeightName: string;

  public dropdownOpen: boolean;

  public get dropdownElement(): Element {
    return this.elem.nativeElement.querySelector('.dropdown-list');
  }

  constructor(
    private productCardRef: MatDialogRef<ProductMenuExpandedCardComponent>,
    private elem: ElementRef
  ) {
    if (this.colourOptions.length < 1) {
      this.selectedColourID = -1;
      this.selectedColourName = 'No colour options';
    } else {
      this.selectedColourID = this.colourOptions[0].id;
      this.selectedColourName = this.colourOptions[0].name;
    }

    if (this.heightOptions.length < 1) {
      this.selectedHeightID = -1;
      this.selectedHeightName = 'No height options';
    } else {
      this.selectedHeightID = this.heightOptions[0].id;
      this.selectedHeightName = this.heightOptions[0].name;
    }

    this.dropdownOpen = false;
  }

  ngOnInit(): void {}

  public selectColour(id: number) {
    this.selectedColourID = id;

    for (let i = 0; i < this.colourOptions.length; i++) {
      if (this.colourOptions[i].id == id) {
        this.selectedColourName = this.colourOptions[i].name;
      }
    }
  }

  public selectHeight(id: number) {
    this.selectedHeightID = id;

    for (let i = 0; i < this.heightOptions.length; i++) {
      if (this.heightOptions[i].id == id) {
        this.selectedHeightName = this.heightOptions[i].name;
      }
    }

    this.closeDropdown();
  }

  public toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    this.dropdownElement.setAttribute(
      'aria-expanded',
      this.dropdownOpen ? 'true' : 'false'
    );
  }

  public closeDropdown() {
    this.dropdownElement.setAttribute('aria-expanded', 'false');
    this.dropdownOpen = false;
  }

  public closeCard() {
    this.productCardRef.close();
  }
}
