import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductMenuExpandedCardComponent } from './product-menu-expanded-card.component';

describe('ProductMenuExpandedCardComponent', () => {
  let component: ProductMenuExpandedCardComponent;
  let fixture: ComponentFixture<ProductMenuExpandedCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductMenuExpandedCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductMenuExpandedCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
