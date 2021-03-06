import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { AppComponent } from './app.component';
import { BikeMapComponent } from './components/bike-map/bike-map.component';
import { SearchComponent } from './components/search/search.component';
import { SearchFormComponent } from './components/search-form/search-form.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';

@NgModule({
  declarations: [
    AppComponent,
    BikeMapComponent,
    SearchComponent,
    SearchFormComponent,
    SearchResultsComponent,
    TabsComponent,
    CheckboxComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
