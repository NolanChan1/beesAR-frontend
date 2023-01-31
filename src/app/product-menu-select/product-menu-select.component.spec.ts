import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductMenuSelectComponent } from './product-menu-select.component';

describe('ProductMenuSelectComponent', () => {
  let component: ProductMenuSelectComponent;
  let fixture: ComponentFixture<ProductMenuSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductMenuSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductMenuSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
