import {property, state} from 'lit/decorators.js';
import {Constructor, GenericObject} from '../typings/globals.types';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {setL11NResources} from '../../redux/actions';
import IntlMessageFormat from 'intl-messageformat';
import { LitElement } from 'lit';

function LocalizeMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class LocalizeClass extends baseClass {
    __localizationCache = {
      messages: {} /* Unique localized strings. Invalidated when the language,
                      formats or resources change. */
    };

    // // @property({type: String})
    language!: string;

    // // @property({type: Object})
    resources!: GenericObject;

    // // @property({type: Object})
    formats = {};

    // // @property({type: Boolean})
    useKeyIfMissing = false;

    // @state()
    localize: (x: string) => string = this.__computeLocalize(this.language, this.resources, this.formats);

    // // @property({type: Boolean})
    bubbleEvent = false;

    updated(changedProperties: Map<string | number | symbol, unknown>) {
      super.updated(changedProperties);
      if (changedProperties.has('language') || changedProperties.has('resources') || changedProperties.has('formats')) {
        this.localize = this.__computeLocalize(this.language, this.resources, this.formats);
      }
    }

    /**
     Returns a computed `localize` method, based on the current `language`.
     */
    __computeLocalize(language?: string, resources?: GenericObject, formats?: any) {
      const proto = this.constructor.prototype;

      // Everytime any of the parameters change, invalidate the strings cache.
      if (!proto.__localizationCache) {
        proto['__localizationCache'] = {messages: {}};
      }
      proto.__localizationCache.messages = {};

      return (...args: any[]) => {
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
        let translatedMessage = proto.__localizationCache.messages[messageKey];

        if (!translatedMessage) {
          translatedMessage = new IntlMessageFormat(translatedValue, language, formats);
          proto.__localizationCache.messages[messageKey] = translatedMessage;
        }

        const argsChanged: GenericObject = {};
        for (let i = 1; i < args.length; i += 2) {
          argsChanged[args[i]] = args[i + 1];
        }

        return translatedMessage.format(argsChanged);
      };
    }

    dispatchResources(locales: GenericObject) {
      this.reduxStore.dispatch(setL11NResources(locales));
      fireEvent(this, 'app-localize-resources-loaded');
    }
  }

  return LocalizeClass;
}

export default LocalizeMixin;
