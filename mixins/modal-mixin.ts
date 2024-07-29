import {LitElement} from 'lit';
import {Constructor} from '../typings/globals.types';
import {property} from 'lit/decorators.js';

function ModalMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class ModalClass extends baseClass {
    @property({type: Boolean, reflect: true})
    opened!: boolean;

    close() {
      this.opened = false;
    }

    open() {
      this.opened = true;
    }
  }

  return ModalClass;
}

export default ModalMixin;
