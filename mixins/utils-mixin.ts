import {LitElement} from 'lit';
import {Constructor, GenericObject} from '../typings/globals.types';
import Settings from '../settings';
declare const dayjs: any;

const pdListStatuses: GenericObject = {
  Signed: 'signed',
  Active: 'active',
  Suspended: 'suspended',
  Ended: 'ended',
  Closed: 'closed',
  Terminated: 'terminated',
  All: 'all'
};

const buildQuery = (chunks: any[]): string => {
  return chunks
    .map((chunk) => {
      switch (typeof chunk) {
        case 'string':
          return chunk;
        case 'object':
          return buildQuery(
            Object.keys(chunk).map((key) => {
              return [encodeURIComponent(key), encodeURIComponent(chunk[key])].join('=');
            })
          );
        default:
          return '';
      }
    })
    .join('&');
};

/**
 * @mixinFunction
 */
function UtilsMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class UtilsClass extends baseClass {
    _equals(a: any, b: any) {
      return a === b;
    }

    _forEach(selector: string, fn: (el: Element) => void) {
      this.shadowRoot?.querySelectorAll(selector).forEach(fn);
    }

    _toLowerCaseLocalized(text: string, localize: (text: string) => string) {
      const localizedText = localize(text);
      if (localizedText) {
        return localizedText.toLowerCase();
      }
      return text;
    }

    _localizeLowerCased(text: string, localize: (x: string) => string) {
      return text ? localize(text.split(' ').join('_').toLowerCase()) : '';
    }

    _singularLocalized(text: string, localize: (x: string) => string) {
      return localize(text).substring(0, text.length - 1);
    }

    _withDefault(value: any, defaultValue: any = '...', localize?: (x: string) => string) {
      if (pdListStatuses[value] !== undefined && localize) {
        return localize(pdListStatuses[value]);
      }

      return value == null ? defaultValue : value;
    }

    _withDefaultFrom(obj: GenericObject, key: string, defaultValue: any = '...') {
      return obj[key] || defaultValue;
    }

    _debug(val: any) {
      return JSON.stringify(val, null, 2);
    }

    _log(val: any) {
      console.log('_log', val);
    }

    _toNumber(val: string) {
      return Number(val);
    }

    _capitalizeFirstLetter(text: string, localize?: (x: string) => string) {
      if (localize) {
        return localize(text);
      }
      if (text) {
        return text[0].toUpperCase() + text.substring(1);
      }
      return '';
    }

    _notFound() {
      window.location.href = '/not-found';
    }

    _clone(val: any) {
      if (val) {
        return JSON.parse(JSON.stringify(val));
      }
      return val;
    }

    _deferred() {
      const defer: GenericObject = {};
      defer.promise = new Promise(function (resolve, reject) {
        defer.resolve = resolve;
        defer.reject = reject;
      });
      return defer;
    }

    _toPercentage(value: any) {
      return value == null ? value : Math.floor(value * 100) + '%';
    }

    _formatIndicatorValue(indicatorType: string, value: any, percentize?: any) {
      if (value == null) {
        return value;
      }

      const _value = value.toFixed(2);

      switch (indicatorType) {
        case 'percentage':
          if (!percentize) {
            return this._toPercentage(value);
          }
          return percentize === 1 ? Math.floor(_value) + '%' : _value + '%';
        case 'ratio':
          return _value + '/1';
        default:
          return _value;
      }
    }

    _displayClusterHeader(subpage: string, needsHeaderList: string[]) {
      return needsHeaderList.includes(subpage);
    }

    _commaSeparated(items: any[]) {
      if (!items) {
        return '';
      }
      return items.join(', ');
    }

    _commaSeparatedDictValues(items: any[], key: string) {
      const newList = (items || []).map((item) => item[key]);
      return this._commaSeparated(newList);
    }

    _commaSeparatedValues(list: any[]) {
      return (list || []).join(', ');
    }

    _formatAddress(street: string, city: string, zip: string) {
      if (!(street || city || zip)) {
        return undefined;
      } else if (!street) {
        return `${city} ${zip}`;
      } else {
        return `${street},${city} ${zip}`;
      }
    }

    _fieldsAreValid() {
      let valid = true;
      const fields = this.shadowRoot!.querySelectorAll('.validate');

      fields.forEach((field) => {
        field.validate();
      });

      fields.forEach((field) => {
        if (field.invalid) {
          valid = false;
        }
      });
      return valid;
    }

    _dateRangeValid(start: string, end: string) {
      const startField = this.shadowRoot!.querySelector(start);
      const endField = this.shadowRoot!.querySelector(end);
      if (!startField || !endField) {
        return true;
      }
      const startValue = startField.value;
      const endValue = endField.value;

      if (!Date.parse(startValue) || !Date.parse(endValue)) {
        if (startField.required) {
          startField.invalid = true;
        }

        if (endField.required) {
          endField.invalid = true;
        }

        return false;
      }

      if (new Date(startField.value) >= new Date(endField.value)) {
        startField.invalid = true;
        endField.invalid = true;

        return false;
      }

      startField.invalid = false;
      endField.invalid = false;

      return true;
    }

    _withDefaultParams(queryParams: GenericObject) {
      return {...queryParams, page: 1, page_size: 10};
    }

    _appendQuery(url: string, ...theRestOfArgs: any[]) {
      if (url === undefined) {
        return;
      }

      return url + '?' + buildQuery(theRestOfArgs);
    }

    _cloneNode(node: HTMLElement) {
      const newNode = node.shadowRoot ? this.deepClone(node) : node.cloneNode(true);

      for (const prop in node) {
        if (Object.prototype.hasOwnProperty.call(node, prop)) {
          try {
            newNode[prop] = node[prop];
          } catch (err) {}
        }
      }

      return newNode;
    }

    deepClone(host: HTMLElement) {
      const cloneNode = (node: HTMLElement, parent: HTMLElement | DocumentFragment) => {
        const walkTree = (nextn: ChildNode | null, nextp: HTMLElement | DocumentFragment) => {
          while (nextn) {
            cloneNode(nextn as HTMLElement, nextp);
            nextn = nextn.nextSibling;
          }
        };

        const clone = node.cloneNode() as HTMLElement;
        parent.appendChild(clone);
        if ((node as any).shadowRoot) {
          walkTree((node as any).shadowRoot.firstChild, clone.attachShadow({mode: 'open'}));
        }

        walkTree(node.firstChild, clone);
      };

      const fragment = document.createDocumentFragment();
      cloneNode(host, fragment);
      return fragment;
    }

    _identity(arg: any) {
      return arg;
    }

    _truncate(str: string, len: number) {
      return str.slice(0, len) + (str.length > len ? '…' : '');
    }

    // USED BY CLUSTER
    // _cancelDebouncers(debouncers: Array<ReturnType<typeof debounce>>) {
    //   debouncers.forEach((debouncer) => {
    //     if (debouncer) {
    //       clearTimeout(debouncer);
    //     }
    //   });
    // }

    _prop(obj: GenericObject, key: string) {
      return obj[key];
    }

    _omit(src: GenericObject, keys: string[]) {
      return Object.keys(src)
        .filter((key) => !keys.includes(key))
        .reduce((acc, key) => {
          acc[key] = src[key];
          return acc;
        }, {} as GenericObject);
    }

    _normalizeDate(date: any) {
      const formattedDate = dayjs(date, Settings.dateFormat, true);
      if (formattedDate.isValid()) {
        return formattedDate.startOf('day').toDate();
      }

      return dayjs(date, Settings.datepickerFormat).startOf('day').toDate();
    }
  }

  return UtilsClass;
}

export default UtilsMixin;
