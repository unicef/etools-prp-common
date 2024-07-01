import {LitElement} from 'lit';
import {Constructor} from '../typings/globals.types';
import {property} from 'lit/decorators.js';

/**
 * @mixinFunction
 */
function PageNavMixin<T extends Constructor<LitElement>>( baseClass: T ) {
  class PageNavClass extends baseClass {
    @property({type: Boolean})
    subMenuOpened = false;

    @property({type: Number})
    selected = 0;

    updated(changedProperties) {
      super.updated(changedProperties);
      if (changedProperties.has('selected')) {
        this._selectedChanged();
      }
    }

    _selectedChanged() {
      setTimeout(() => {
        const normalMenuItemOpened = this.shadowRoot!.querySelectorAll('.nav-menu-item.selected').length > 0;
        this.subMenuOpened = !normalMenuItemOpened;
      }, 200);
    }
  }

  return PageNavClass;
}

export default PageNavMixin;
