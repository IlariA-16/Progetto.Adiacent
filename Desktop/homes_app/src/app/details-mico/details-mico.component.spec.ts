import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsMicoComponent } from './details-mico.component';

describe('DetailsMicoComponent', () => {
  let component: DetailsMicoComponent;
  let fixture: ComponentFixture<DetailsMicoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DetailsMicoComponent]
    });
    fixture = TestBed.createComponent(DetailsMicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
