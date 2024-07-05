import {Constructor} from '../typings/globals.types';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {setL11NResources} from '../../redux/actions';
import IntlMessageFormat from 'intl-messageformat';
import {LitElement} from 'lit';
import {property, state} from 'lit/decorators.js';
import {store} from '../../redux/store';
import {RootState} from '../../typings/redux.types';
import {connect} from 'pwa-helpers';

function LocalizeMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class LocalizeClass extends connect(store)(baseClass) {
    __localizationCache = {
      messages: {} /* Unique localized strings. Invalidated when the language,
                      formats or resources change. */
    };

    @property({type: String})
    language!: string;

    @property({type: Object})
    resources!: any;

    @property({type: Object})
    formats = {};

    @property({type: Boolean})
    useKeyIfMissing = false;

    @property({type: Boolean})
    bubbleEvent = false;

    constructor(...args) {
      super(...args);
      this.clearCache();
    }

    stateChanged(state: RootState) {
      if (this.language !== state.localize.language || this.resources !== state.localize.resources) {
        this.language = state.localize.language;
        this.resources = state.localize.resources;
        this.clearCache();
      }
    }

    clearCache() {
      if (!this.constructor.prototype.__localizationCache) {
        this.constructor.prototype['__localizationCache'] = {messages: {}};
      }
      this.constructor.prototype.__localizationCache.messages = {};
    }

    /**
     Returns a computed `localize` method, based on the current `language`.
     */
    localize(...args: any[]) {
      const resources = store.getState().localize.resources;
      const language = store.getState().localize.language;

      const key = args[0];
      if (!key || !resources || !language || !resources[language]) {
        return;
      }

      // Cache the key/value pairs for the same language, so that we don't
      // do extra work if we're just reusing strings across an application.
      const translatedValue = resources[language][key];

      if (!translatedValue) {
        return this.useKeyIfMissing ? key : '';
      }

      const messageKey = key + translatedValue;
      let translatedMessage = this.constructor.prototype.__localizationCache.messages[messageKey];

      if (!translatedMessage) {
        translatedMessage = new IntlMessageFormat(translatedValue, language, this.formats);
        this.constructor.prototype.__localizationCache.messages[messageKey] = translatedMessage;
      }

      const argsChanged: any = {};
      for (let i = 1; i < args.length; i += 2) {
        argsChanged[args[i]] = args[i + 1];
      }

      return translatedMessage.format(argsChanged);
    }

    dispatchResources(locales: any) {
      store.dispatch(setL11NResources(locales));
      fireEvent(this, 'app-localize-resources-loaded');
    }
  }

  return LocalizeClass;
}

export default LocalizeMixin;
