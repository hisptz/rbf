import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AssessmentConfiguration } from '../../../configuration/models/assessment-configuration.model';
import { State } from 'src/app/store/reducers';
import { Store } from '@ngrx/store';
import {
  getAssessmentConfigurations,
  getAssessmentConfigurationsCount,
} from 'src/app/store/selectors';
import { SelectionFilterConfig } from '@iapps/ngx-dhis2-selection-filters';
import { getGeneralConfigurationOrunitLevel } from 'src/app/store/selectors/general-configuration.selectors';
import { FormDataPayload } from 'src/app/shared/models/form-data.model';
import { addFormDatavalues } from 'src/app/store/actions';
import { getAssessmentDataSet } from 'src/app/store/actions/data-set.actions';
import { getGeneralConfigurationPeriodType } from '../../../../store/selectors/general-configuration.selectors';
import { loadFormDataValues } from '../../../../store/actions/form-data.actions';
import { AssessmentData } from '../../../verification/models/assessment-data';
import { getAssessmentFormStructure } from '../../../../store/selectors/assessment-configuration.selectors';

@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.css'],
})
export class AssessmentComponent implements OnInit {
  assessmentIndicators$: Observable<AssessmentData[]>;
  orgUnitLevel$: Observable<string>;

  dataSelections: any[];
  selectionFilterConfig: SelectionFilterConfig = {
    allowStepSelection: true,
    showDynamicDimension: false,
    showDataFilter: false,
    showValidationRuleGroupFilter: false,
    stepSelections: ['ou', 'pe'],
    disablePeriodTypeSelection: true,
    periodFilterConfig: {
      singleSelection: true,
    },
    orgUnitFilterConfig: {
      showUserOrgUnitSection: false,
      singleSelection: true,
      showOrgUnitGroupSection: false,
      showOrgUnitLevelSection: false,
      showOrgUnitLevelGroupSection: false,
    },
  };

  // Form properties
  showForm = false;
  createArray = true;
  allConfigurations = [];
  formTitle = 'Assessment Form';
  possibleMaxValue = [];
  possibleMaxValueSum = 0;
  obtainedValue = [];
  obtainedValueSum = 0;
  percentage = [];
  percentageSum = 0;
  selection = [];
  assessmentCount: number;
  orgUnitLevel = '';
  selectedPeriodType = '';
  dataPresence = false;
  isFormComplete = [];
  isApplicable = [];

  // TODO take care of memory leaks
  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.store.dispatch(getAssessmentDataSet());
    this.assessmentIndicators$ = this.store.select(getAssessmentFormStructure);
    this.store
      .select(getGeneralConfigurationOrunitLevel)
      .subscribe(orgUnitLevel => (this.orgUnitLevel = orgUnitLevel));
    this.store
      .select(getAssessmentConfigurationsCount)
      .subscribe(count => (this.assessmentCount = count));
    this.store
      .select(getAssessmentConfigurations)
      .subscribe(configs => (this.allConfigurations = configs));
    this.store
      .select(getGeneralConfigurationPeriodType)
      .subscribe(periodType => (this.selectedPeriodType = periodType));
    this.addPeriodTypeConfig();
  }

  addPeriodTypeConfig() {
    this.selectionFilterConfig = {
      ...this.selectionFilterConfig,
      // selectedPeriodType: this.selectedPeriodType,
    };
  }

  loadDataValues() {
    this.store.dispatch(
      loadFormDataValues({
        dataRequest: {
          period: this.dataSelections[0].items[0].id,
          orgUnit: this.dataSelections[1].items[0].id,
        },
      })
    );
  }

  onFilterUpdateAction(dataSelections) {
    if (dataSelections.length > 1) {
      this.dataSelections = dataSelections;
      this.showForm = true;
      this.loadDataValues();
      this.formTitle = 'Summary of '.concat(
        dataSelections[0].items[0].type +
          ' Quality Activities/ Areas Assessment Results of the ' +
          this.orgUnitLevel
      );
      if (this.createArray) {
        this.createFormArrays(this.assessmentCount);
        this.createArray = false;
      }
    }
  }

  createFormArrays(assessmentCount) {
    if (assessmentCount > 0) {
      this.dataPresence = true;
    }
    for (let a = 0; a < assessmentCount; a++) {
      this.possibleMaxValue.push(0);
      this.obtainedValue.push(0);
      this.selection.push(0);
      this.percentage.push(0);
      this.isFormComplete.push(false);
      this.isApplicable.push(true);
    }
    this.posssibleMaxValueInitializer(assessmentCount);
  }

  posssibleMaxValueInitializer(index) {
    for (let a = 0; a < index; a++) {
      this.possibleMaxValue[a] = this.allConfigurations[a].possibleMaxValue;
      this.possibleMaxValueSum += this.possibleMaxValue[a];
    }
  }
  onSaveDataValues(index, dataElement) {
    const dataValue: FormDataPayload = {
      dataElement: dataElement,
      value: this.obtainedValue[index],
      period: this.dataSelections[0].items[0].id,
      orgUnit: this.dataSelections[1].items[0].id,
    };
    this.store.dispatch(addFormDatavalues({ payload: dataValue }));
  }
  onInputChange(index) {
    if (
      this.obtainedValue[index] > this.allConfigurations[index].possibleMaxValue
    ) {
      window.alert(
        'Input Value Exceeded the Possible Maximum Value of:' +
          this.allConfigurations[index].possibleMaxValue
      );
      this.obtainedValue[index] = 0;
    }
    this.onFormUpdate(index);
  }
  onOptionSelect(index, value) {
    this.selection[index] = value;

    if (this.selection[index] === 0) {
      this.obtainedValue[index] = 0;
    }
    this.onFormUpdate(index);
  }

  onFormUpdate(index) {
    this.percentage[index] = parseFloat(
      (
        (100 * this.obtainedValue[index]) /
        this.possibleMaxValue[index]
      ).toFixed(2)
    );
    this.total(this.assessmentCount);
  }

  total(count) {
    let checker = 0;
    this.obtainedValueSum = 0;
    let percentageSum = 0;
    for (let index = 0; index < count; index++) {
      this.obtainedValueSum += this.obtainedValue[index];
      percentageSum += this.percentage[index];
      if (this.obtainedValue[index] !== 0) {
        checker++;
      }
    }
    this.percentageSum = parseFloat((percentageSum / checker).toFixed(2));
  }

  completeForm() {
    for (let a = 0; a < this.assessmentCount; a++) {
      this.isFormComplete[a] = true;
    }
  }

  incompleteForm() {
    for (let a = 0; a < this.assessmentCount; a++) {
      this.isFormComplete[a] = false;
    }
  }
  notApplicable(index) {
    this.isApplicable[index] = false;
  }
}
