import { Component, OnInit } from '@angular/core'
import { FormGroup } from '@angular/forms'
import { AlertService, CloudAppSettingsService, FormGroupUtil } from '@exlibris/exl-cloudapp-angular-lib'
import { Settings } from '../models/settings.model'
import { ConfigurationService } from '../services/configuration.service'

@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

	form: FormGroup
	saving: boolean = false
	defaultUrl: string

	constructor(
		private configurationService: ConfigurationService,
		private settingsService: CloudAppSettingsService,
		private alert: AlertService,
	) { }

	ngOnInit() {
		this.form = FormGroupUtil.toFormGroup(new Settings())

		this.saving = true
		this.settingsService.get().subscribe(settings => {
			this.form = FormGroupUtil.toFormGroup(Object.assign(new Settings(), settings))
			console.log(settings)
			this.saving = false
		})
		this.configurationService.getAlmaUrlFromConfig().subscribe(url => this.defaultUrl = url)
	}

	save() {
		this.saving = true
		this.settingsService.set(this.form.value).subscribe(
			response => {
				this.alert.success('Settings successfully saved.')
				this.form.markAsPristine()
			},
			err => this.alert.error(err.message),
			() => this.saving = false
		)
	}
}
