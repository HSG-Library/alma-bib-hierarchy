import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { ConfigurationComponent } from './configuration/configuration.component'
import { MainComponent } from './main/main.component'
import { SettingsComponent } from './settings/settings.component'

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'config', component: ConfigurationComponent },
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
