import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {JsonReaderService} from './services/json-reader.service';
import {HttpClientModule} from '@angular/common/http';
import {HudService} from './services/hud.service';
import {MenuService} from './services/menu.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [
    JsonReaderService,
    HudService,
    MenuService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
