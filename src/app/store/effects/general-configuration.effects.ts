import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError, mergeMap } from 'rxjs/operators';
import { UID } from '../../shared/helpers/generate-uid';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import {
  addSystemInfo,
  loadGeneralConfigurationsSucess,
  addGeneralConfigurations,
  addGeneralConfigurationsSuccess,
  addGeneralConfigurationsFail,
  updateGeneralConfigurations,
  updateGeneralConfigurationsFail,
  loadGeneralConfigurationsFail,
  updateGeneralConfigurationsSuccess,
  loadDefaultGeneralConfigurations
} from '../actions';
import { ConfigurationService } from 'src/app/pages/configuration/services/configuration.service';
import { ErrorMessage } from 'src/app/core';

@Injectable()
export class GeneralConfigurationEffects {
  dataStoreNamespace: string;
  constructor(
    private actions$: Actions,
    private configService: ConfigurationService,
    private _snackBar: MatSnackBar
  ) {
    this.dataStoreNamespace = 'rbf-general-config';
  }

  loadConfigurations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addSystemInfo),
      switchMap(() =>
        this.configService
          .getGeneralConfigurations(this.dataStoreNamespace)
          .pipe(
            map(config =>
              loadGeneralConfigurationsSucess({ configurations: config })
            )
          )
      ),
      catchError((error: ErrorMessage) => {
        if (error.status !== 404) {
          this._snackBar.open('Loading General Configuration', 'FAIL', {
            duration: 1000
          });
          return of(loadGeneralConfigurationsFail({ error: error }));
        } else {
          const defaultConfig = this.getDefaultConfig();
          return of(
            loadDefaultGeneralConfigurations({ configuration: defaultConfig })
          );
        }
      })
    )
  );

  loadDefaultConfigurations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadDefaultGeneralConfigurations),
      switchMap(action =>
        this.configService
          .addDefaultGeneralConfiguration(
            this.dataStoreNamespace,
            action.configuration
          )
          .pipe(
            map(config =>
              loadGeneralConfigurationsSucess({
                configurations: action.configuration
              })
            )
          )
      ),
      catchError(err => {
        this._snackBar.open('Loading General Configuration', 'FAIL', {
          duration: 1000
        });
        return of(loadGeneralConfigurationsFail({ error: err }));
      })
    )
  );

  addConfigurations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addGeneralConfigurations),
      mergeMap(action => {
        this._snackBar.open('Adding General Configuration', '', {
          duration: 1000
        });
        return this.configService
          .createConfiguration(this.dataStoreNamespace, action.configuration)
          .pipe(
            map(() => {
              this._snackBar.open('Adding General Configuration', 'SUCCESS', {
                duration: 1000
              });
              return addGeneralConfigurationsSuccess({
                configuration: action.configuration
              });
            })
          );
      }),
      catchError(error => {
        this._snackBar.open('Adding General Configuration', 'FAIL', {
          duration: 1000
        });
        return of(addGeneralConfigurationsFail({ error: error }));
      })
    )
  );

  updateConfigurations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateGeneralConfigurations),
      mergeMap(action => {
        this._snackBar.open('Updating General Configuration', '', {
          duration: 1000
        });
        return this.configService
          .updateConfiguration(
            this.dataStoreNamespace,
            action.configuration.id,
            action.configuration
          )
          .pipe(
            map(() => {
              this._snackBar.open('Updating General Configuration', 'SUCCESS', {
                duration: 1000
              });
              return updateGeneralConfigurationsSuccess({
                configuration: action.configuration
              });
            })
          );
      }),
      catchError(error => {
        this._snackBar.open('Updating General Configuration', 'FAIL', {
          duration: 1000
        });
        return of(updateGeneralConfigurationsFail({ error: error }));
      })
    )
  );

  getDefaultConfig() {
    const date = new Date();
    return {
      id: 'default',
      user: null,
      created: date,
      errorRate: 10,
      lastUpdate: date,
      periodType: 'Quarterly',
      verification: UID(),
      assessment: UID(),
      categoryCombo: {
        id: 'bjDvmb4bfuf'
      },
      organisationUnitLevel: {
        id: 'm9lBJogzE95',
        level: 4,
        displayName: 'Facility'
      }
    };
  }
}
