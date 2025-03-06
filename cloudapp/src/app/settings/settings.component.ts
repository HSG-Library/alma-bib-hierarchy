import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import {
  AlertService,
  CloudAppSettingsService,
  FormGroupUtil,
} from '@exlibris/exl-cloudapp-angular-lib';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { Settings } from '../models/settings.model';
import { ConfigurationService } from '../services/configuration.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  public form!: FormGroup;
  public saving: boolean = false;
  public defaultUrl!: string;
  public defaultNetworkCode!: string;
  public titleTranslationKey = 'settings.title';
  public subtitleTranslationKey = 'settings.subtitle';

  public constructor(
    private configurationService: ConfigurationService,
    private settingsService: CloudAppSettingsService,
    private alert: AlertService,
    private destroyRef: DestroyRef
  ) {}

  public ngOnInit() {
    this.form = FormGroupUtil.toFormGroup(new Settings());

    this.saving = true;
    this.settingsService.get().subscribe((settings) => {
      this.form = FormGroupUtil.toFormGroup(
        Object.assign(new Settings(), settings)
      );
      this.saving = false;
    });
    this.configurationService
      .getAlmaUrlFromConfig()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((url) => (this.defaultUrl = url))
      )
      .subscribe();
    this.configurationService
      .getNetworkCodeFromConfig()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((networkCode) => (this.defaultNetworkCode = networkCode))
      )
      .subscribe();
  }

  public save() {
    this.saving = true;
    this.configurationService.resetNZUrlCache();
    this.settingsService
      .set(this.form.value)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          this.alert.success('Settings successfully saved.');
          this.form.markAsPristine();
        }),
        catchError((err) => {
          this.alert.error(err.message);
          return EMPTY;
        }),
        finalize(() => (this.saving = false))
      )
      .subscribe();
  }
}
