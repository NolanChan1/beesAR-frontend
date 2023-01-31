import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CurrentSelectionService {
  private _name: string;
  private _picture: string;
  private _price: string;
  private _height: string;
  private _colourName: string;
  private _description: string;

  constructor() {
    this._name = '3” Rolled Beeswax Pillar Candle';
    this._picture = 'assets/images/rolled-candle.png';
    this._price = '$25.00';
    this._height = '4”';
    this._colourName = 'Banana';
    this._description =
      'Made from hexagon patterned beeswax sheets, our pillar candles are stunning to look at on their own and while they burn. Beeswax is a great option for people who have sensitivities to scents or adverse reactions to other types of waxes.';
  }

  get name() {
    return this._name;
  }

  get picture() {
    return this._picture;
  }

  get price() {
    return this._price;
  }

  get height() {
    return this._height;
  }

  get colourName() {
    return this._colourName;
  }

  get description() {
    return this._description;
  }
}
