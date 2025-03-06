import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import {
  AlertService,
  CloudAppConfigService,
  FormGroupUtil,
} from '@exlibris/exl-cloudapp-angular-lib';
import { EMPTY, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Settings } from '../models/settings.model';
import { ConfigurationService } from '../services/configuration.service';
import { LogService } from '../services/log.service';

@Component({
  selector: 'app-config',
  templateUrl: '../settings/settings.component.html',
  styleUrls: ['../settings/settings.component.scss'],
})
export class ConfigurationComponent implements OnInit {
  public form!: FormGroup;
  public saving: boolean = false;
  public defaultUrl: string = '';
  public defaultNetworkCode: string = '';
  public titleTranslationKey = 'configuration.title';
  public subtitleTranslationKey = 'configuration.subtitle';

  constructor(
    private configurationService: ConfigurationService,
    private settingsService: CloudAppConfigService,
    private alert: AlertService,
    private log: LogService,
    private destroyRef: DestroyRef
  ) {}

  public ngOnInit() {
    this.form = FormGroupUtil.toFormGroup(new Settings());
    this.saving = true;
    this.settingsService
      .get()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          this.log.error('Error getting settings', error);
          this.alert.error('Error getting settings');
          return EMPTY;
        }),
        tap((settings) => {
          this.form = FormGroupUtil.toFormGroup(
            Object.assign(new Settings(), settings)
          );
          this.saving = false;
        })
      )
      .subscribe();

    this.configurationService
      .getAlmaUrlFromApi()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          this.log.error('Error getting Alma URL', error);
          return EMPTY;
        }),
        tap((url) => (this.defaultUrl = url))
      )
      .subscribe();

    this.configurationService
      .getNetworkCodeFromApi()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          this.log.error('Error getting network code', error);
          return EMPTY;
        }),
        tap((networkCode) => (this.defaultNetworkCode = networkCode))
      )
      .subscribe();
  }

  public save() {
    this.saving = true;
    this.settingsService
      .set(this.form.value)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          this.alert.error(error.message);
          this.log.error('Error saving settings', error);
          return EMPTY;
        }),
        tap(() => {
          this.alert.success('Settings successfully saved.');
          this.form.markAsPristine();
        }),
        finalize(() => (this.saving = false))
      )
      .subscribe();
  }
}
