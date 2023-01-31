import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { CurrentSelectionService } from './current-selection.service';
import { ProductMenuComponent } from './product-menu/product-menu.component';
import { ProductMenuSelectComponent } from './product-menu-select/product-menu-select.component';

import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IconModule } from '@visurel/iconify-angular';

@NgModule({
  declarations: [
    AppComponent,
    ProductMenuComponent,
    ProductMenuSelectComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    IconModule,
    BrowserAnimationsModule,
    MatBottomSheetModule,
  ],
  providers: [CurrentSelectionService],
  bootstrap: [AppComponent],
})
export class AppModule {}
