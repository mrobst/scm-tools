import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportEv3Component } from './import-ev3.component';

describe('ImportEv3Component', () => {
  let component: ImportEv3Component;
  let fixture: ComponentFixture<ImportEv3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportEv3Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImportEv3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
