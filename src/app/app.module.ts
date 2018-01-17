import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {JsonReaderService} from './services/json-reader.service';
import {HttpClientModule} from '@angular/common/http';
import {HudService} from './services/hud.service';
import {ParticleService} from './services/particles.service';
import {SceneService} from './services/scene.service';
import {MapService} from './services/map.service';

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
    ParticleService,
    SceneService,
    MapService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
