import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  AlertService,
  CloudAppConfigService,
  FormGroupUtil,
} from '@exlibris/exl-cloudapp-angular-lib';
import { Settings } from '../models/settings.model';
import { ConfigurationService } from '../services/configuration.service';

@Component({
  selector: 'app-config',
  templateUrl: '../settings/settings.component.html',
  styleUrls: ['../settings/settings.component.scss'],
})
export class ConfigurationComponent implements OnInit {
  form: FormGroup;
  saving: boolean = false;
  defaultUrl: string;
  defaultNetworkCode: string;

  constructor(
    private configurationService: ConfigurationService,
    private settingsService: CloudAppConfigService,
    private alert: AlertService
  ) {}

  ngOnInit() {
    this.form = FormGroupUtil.toFormGroup(new Settings());
    this.saving = true;
    this.settingsService.get().subscribe((settings) => {
      this.form = FormGroupUtil.toFormGroup(
        Object.assign(new Settings(), settings)
      );
      this.saving = false;
    });
    this.configurationService
      .getAlmaUrlFromApi()
      .subscribe((url) => (this.defaultUrl = url));
    this.configurationService
      .getNetworkCodeFromApi()
      .subscribe((networkCode) => (this.defaultNetworkCode = networkCode));
  }

  save() {
    this.saving = true;
    this.settingsService.set(this.form.value).subscribe(
      (response) => {
        this.alert.success('Settings successfully saved.');
        this.form.markAsPristine();
      },
      (err) => this.alert.error(err.message),
      () => (this.saving = false)
    );
  }
}
