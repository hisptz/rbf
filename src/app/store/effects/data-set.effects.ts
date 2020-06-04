import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as _ from 'lodash';
import { DataSetService } from 'src/app/shared/services/data-set.service';
import {
  getAssessmentDataSet,
  getVerificationDataSet,
  getDataSetSuccess,
  getDataSetFail,
} from '../actions/data-set.actions';
import { switchMap, withLatestFrom, map, catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { State } from '../reducers';
import {
  getAssessmentDataSetId,
  getVerificationDataSetId,
  getGeneralConfigurationPeriodType,
} from '../selectors/general-configuration.selectors';
import { of } from 'rxjs';
import {
  getOrganisationUnits,
  getAssessmentConfigurationDataElements,
  getVerificationConfigurationDataElements,
} from '../selectors';
import { CategoryComboService } from 'src/app/shared/services/category-combo.service';
import { DataElement } from '@iapps/ngx-dhis2-data-filter';
import { DataSet, DataSets } from 'src/app/shared/models/data-set.model';
import {UID} from '../../shared/helpers/generate-uid'

@Injectable()
export class DataSetEffects {
  constructor(
    private actions$: Actions,
    private dataSetService: DataSetService,
    private categoryService: CategoryComboService,
    private store: Store<State>
  ) {}

  getVerificationDataSet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getVerificationDataSet),
      withLatestFrom(this.store.select(getVerificationDataSetId)),
      withLatestFrom(this.store.select(getOrganisationUnits)),
      withLatestFrom(this.store.select(getGeneralConfigurationPeriodType)),
      withLatestFrom(
        this.store.select(getVerificationConfigurationDataElements)
      ),
      withLatestFrom(this.categoryService.getDefaultCategoryCombo()),
      switchMap(
        ([
          [[[[action, id], organisationUnits], periodType], dataElements],
          category,
        ]) => {
          const dataSet = this.getDataSetPayload(
            id,
            organisationUnits,
            periodType,
            dataElements,
            category,
            'verification'
          );
          const dataSets: DataSets = { dataSets: [dataSet] };
          return this.dataSetService.createDefaultDataSet(dataSets).pipe(
            map(() => getDataSetSuccess()),
            catchError(error => of(getDataSetFail({ error: error })))
          );
        }
      )
    )
  );

  getAssessmentDataSet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getAssessmentDataSet),
      withLatestFrom(this.store.select(getAssessmentDataSetId)),
      withLatestFrom(this.store.select(getOrganisationUnits)),
      withLatestFrom(this.store.select(getGeneralConfigurationPeriodType)),
      withLatestFrom(this.store.select(getAssessmentConfigurationDataElements)),
      withLatestFrom(this.categoryService.getDefaultCategoryCombo()),
      switchMap(
        ([
          [[[[action, id], organisationUnits], periodType], dataElements],
          category,
        ]) => {
          const dataSet = this.getDataSetPayload(
            id,
            organisationUnits,
            periodType,
            dataElements,
            category,
            'assessment'
          );
          const dataSets: DataSets = { dataSets: [dataSet] };
          return this.dataSetService.createDefaultDataSet(dataSets).pipe(
            map(() => getDataSetSuccess()),
            catchError(error => of(getDataSetFail({ error: error })))
          );
        }
      )
    )
  );

  getDataSetPayload(
    dataSetId: string,
    organisationUnits: { id: string }[],
    periodType: string,
    dataELements: Array<{ id: string }>,
    category: { categoryCombos: { id: string }[] },
    formName: string
  ): DataSet {
    return {
      id: dataSetId,
      timelyDays: 15,
      name: formName,
      shortName: `RBF ${formName} form`,
      code: '',
      description: '',
      publicAccess: 'rwr-----',
      periodType: periodType,
      categoryCombo: category.categoryCombos[0],
      openFuturePeriods: 0,
      expiryDays: 0,
      organisationUnits: organisationUnits,
      dataSetElements: this.getDataSetElements(dataELements, dataSetId),
    };
  }

  getDataSetElements(
    dataElements: { id: string }[],
    dataSetId: string
  ): Array<{
    id: string;
    dataSet: { id: string };
    dataElement: Array<{ id: string }>;
  }> {
    return _.map(dataElements, (dataELement: DataElement) =>
      _.assign(
        {},
        { dataSet: { id: dataSetId }, id: UID(), dataElement: dataELement }
      )
    );
  }
}
