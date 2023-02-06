import { Component } from '@angular/core';

import {
  MatBottomSheet,
  MatBottomSheetConfig,
} from '@angular/material/bottom-sheet';
import { IconService } from '@visurel/iconify-angular';
import { appIcons } from './icons';
import { ProductMenuComponent } from './product-menu/product-menu.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'beesAR-frontend';

  constructor(
    private matBottomSheet: MatBottomSheet,
    iconService: IconService
  ) {
    iconService.registerAll(appIcons);
  }

  onTriggerProductMenu() {
    const options = new MatBottomSheetConfig();
    options.panelClass = 'remove-default';
    this.matBottomSheet.open(ProductMenuComponent, {
      panelClass: 'remove-default',
    });
  }
}
