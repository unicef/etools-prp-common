import {LitElement} from 'lit';
import {Constructor} from '../typings/globals.types';
import {fireEvent} from '@unicef-polymer/etools-utils/src/fire-event.util';

function ErrorHandlerMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class ErrorHandlerClass extends baseClass {
    _handleError(e: CustomEvent) {
      let xhr;
      try {
        xhr = e.detail.request.xhr;
        if (!xhr) {
          return;
        }
        switch (xhr.status) {
          case 401:
            fireEvent(this, 'sign-out');
            break;
          default:
            break;
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  return ErrorHandlerClass;
}

export default ErrorHandlerMixin;
