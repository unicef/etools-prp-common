import {LitElement} from 'lit';
import {property, state} from 'lit/decorators.js';
import {Constructor} from '../typings/globals.types';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

function FilterMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class FilterClass extends baseClass {
    @property({type: String})
    label!: string;
    @property({type: String})
    name!: string;
    @state()
    lastValue!: string;

    updated(changedProperties) {
      super.updated(changedProperties);
      if (changedProperties.has('value')) {
        this.lastValue = this._computeLastValue(this.value);
      }
    }

    _computeLastValue(value: any) {
      return value;
    }

    _filterReady() {
      setTimeout(() => {
        fireEvent(this, 'filter-ready', this.name);
      });
    }

    connectedCallback() {
      super.connectedCallback();
      fireEvent(this, 'register-filter', this.name);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      fireEvent(this, 'deregister-filter', this.name);
    }
  }

  return FilterClass;
}

export default FilterMixin;
