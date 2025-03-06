import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  AlertModule,
  CloudAppTranslateModule,
  MaterialModule,
} from '@exlibris/exl-cloudapp-angular-lib';

import { ClipboardModule } from '@angular/cdk/clipboard';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { PopupComponent } from './popup/popup.component';
import { ResultTableComponent } from './result-table/result-table.component';
import { SettingsComponent } from './settings/settings.component';
import { ConfigurationComponent } from './configuration/configuration.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ResultTableComponent,
    PopupComponent,
    SettingsComponent,
    ConfigurationComponent,
  ],
  bootstrap: [AppComponent],
  imports: [
    MaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AlertModule,
    FormsModule,
    ReactiveFormsModule,
    ClipboardModule,
    CloudAppTranslateModule.forRoot(),
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'fill' },
    },
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {}
