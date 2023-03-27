import './polyfills';

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
//This will tell typescript that window also contains ngRef property
type windowExtended = Window &
  typeof globalThis & {
    ngRef: NgModuleRef<AppModule>;
  };
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then((ref) => {
    // Ensure Angular destroys itself on hot reloads.
    const _window = window as windowExtended;
    if (_window['ngRef']) {
      _window['ngRef'].destroy();
    }
    _window['ngRef'] = ref;

    // Otherwise, log the boot error
  })
  .catch((err) => console.error(err));
