import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { Constructor, GenericObject } from '../typings/globals.types';
import Settings from '../settings';

/**
 * @mixinFunction
 */
function ResponsiveMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class ResponsiveClass extends baseClass {
    @property({ type: String })
    desktopLayoutQuery: string = Settings.layout.threshold;

    @property({ type: Boolean })
    isDesktop: boolean = false;

    updated(changedProperties: Map<string | number | symbol, unknown>) {
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
