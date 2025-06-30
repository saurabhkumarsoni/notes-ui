import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomAutocomplete } from './custom-autocomplete';

describe('CustomAutocomplete', () => {
  let component: CustomAutocomplete;
  let fixture: ComponentFixture<CustomAutocomplete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomAutocomplete]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomAutocomplete);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
