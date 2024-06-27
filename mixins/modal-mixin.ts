import {LitElement} from 'lit';
import {Constructor} from '../typings/globals.types';

function ModalMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class ModalClass extends baseClass {
    // @property({type: Boolean, reflect: true})
    opened!: boolean;

    // @query('#dialog')
    // dialog!: any;

    // private _adjustPositionDebouncer: ReturnType<typeof debounce> | null = null;

    close() {
      this.opened = false;
    }

    open() {
      this.opened = true;
    }

    adjustPosition(e: CustomEvent) {
      if (!e) {
        return;
      }
      if (e.stopPropagation) {
        e.stopPropagation();
      }

      // TODO
      // this._adjustPositionDebouncer = debounce(() => {
      //   if (this.dialog) {
      //     this.dialog.refit();
      //   }
      // }, 100);
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      // TODO
      // if (this._adjustPositionDebouncer && this._adjustPositionDebouncer.isActive()) {
      //   this._adjustPositionDebouncer.cancel();
      // }
    }
  }

  return ModalClass;
}

export default ModalMixin;
