import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

@Component({
  selector: 'product-menu-select',
  templateUrl: './product-menu-select.component.html',
  styleUrls: ['./product-menu-select.component.css'],
})
export class ProductMenuSelectComponent implements OnInit {
  @Input() options: any = [];
  @Output() currentValueChange = new EventEmitter();

  public currentValue;
  public dropdownOpen: boolean = false;
  public get dropdownElement(): Element {
    return this.elem.nativeElement.querySelector('.dropdown-list');
  }

  constructor(private elem: ElementRef) {
    this.currentValue = this.options[0];
  }

  ngOnInit(): void {
    this.currentValue = this.options[0];
  }

  closeDropdown() {
    this.dropdownElement.setAttribute('aria-expanded', 'false');
    this.dropdownOpen = false;
  }

  select(value: any) {
    this.currentValue = value;
    this.closeDropdown();
    this.currentValueChange.emit(this.currentValue);
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    this.dropdownElement.setAttribute(
      'aria-expanded',
      this.dropdownOpen ? 'true' : 'false'
    );
  }
}
