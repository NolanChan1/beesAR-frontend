import { TestBed } from '@angular/core/testing';

import { CurrentSelectionService } from './current-selection.service';

describe('CurrentSelectionService', () => {
  let service: CurrentSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrentSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
