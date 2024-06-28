import {LitElement} from 'lit';
import {Constructor} from '../typings/globals.types';
import Settings from '../settings';
import {property} from 'lit/decorators';

/**
 * @mixinFunction
 */
function ResponsiveMixin<T extends Constructor<LitElement>>( baseClass: T ) {
  class ResponsiveClass extends baseClass {
    @property({type: String})
    desktopLayoutQuery: string = Settings.layout.threshold;

    @property({type: Boolean})
    isDesktop: boolean = false;

    updated(changedProperties) {
      super.updated(changedProperties);
      if (changedProperties.has('isDesktop')) {
        this._isDesktopChanged();
      }
    }

    _isDesktopChanged() {
      this.requestUpdate();
    }
  }

  return ResponsiveClass;
}

export default ResponsiveMixin;
