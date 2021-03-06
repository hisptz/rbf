import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoutingModule } from './configuration.routes';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatMenuModule,
  MatIconModule,
  MatDialogModule,
  MatInputModule,
  MatButtonModule,
  MatOptionModule,
  MatSelectModule
} from '@angular/material';

import * as fromConfiguration from './components';
import { HttpClientModule } from '@angular/common/http';

import { NgxDhis2PeriodFilterModule } from '@iapps/ngx-dhis2-period-filter';
import { NgxDhis2OrgUnitFilterModule } from '@iapps/ngx-dhis2-org-unit-filter';
import { DataElementPipe } from './pipes/data-element.pipe';
import { DeleteAssessmentComponent } from './components/assessment-config/delete-assessment/delete-assessment.component';
import { DeleteVerificationComponent } from './components/verification-config/delete-verification/delete-verification.component';

@NgModule({
  declarations: [...fromConfiguration.components, DataElementPipe],
  imports: [
    CommonModule,
    RoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxDhis2PeriodFilterModule,
    NgxDhis2OrgUnitFilterModule,
    MatDialogModule,
    MatMenuModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatOptionModule,
    MatSelectModule
  ],
  entryComponents: [DeleteAssessmentComponent, DeleteVerificationComponent]
})
export class ConfigurationModule {}
