import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificationListComponent } from './verification-list.component';
import {
  MatMenuModule,
  MatIconModule,
  MatDialogModule
} from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { metaReducers, reducers } from 'src/app/store/reducers';
import { DataElementPipe } from '../../../pipes/data-element.pipe';

describe('VerificationListComponent', () => {
  let component: VerificationListComponent;
  let fixture: ComponentFixture<VerificationListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatMenuModule,
        MatIconModule,
        MatDialogModule,
        RouterTestingModule,
        StoreModule.forRoot(reducers, { metaReducers })
      ],
      declarations: [VerificationListComponent, DataElementPipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerificationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
