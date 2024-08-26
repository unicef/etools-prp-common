import {LitElement} from 'lit';
import {Constructor} from '../typings/globals.types';
import Settings from '../settings';
import {get as getTranslation} from 'lit-translate';
import dayjs from 'dayjs';

const pdListStatuses: any = {
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
    getReportName(type: string, index: number) {
      const typeLocalized = getTranslation(type.toLowerCase());
      if (typeLocalized) {
        return getTranslation(type.toLowerCase()).split(' ')[0] + (index + 1);
      }
      return type;
    }

    _equals(a: any, b: any) {
      return a === b;
    }

    _forEach(selector: string, fn: (el: Element) => void) {
      this.shadowRoot?.querySelectorAll(selector).forEach(fn);
    }

    _toLowerCaseLocalized(text: string) {
      const localizedText = getTranslation(text);
      if (localizedText) {
        return localizedText.toLowerCase();
      }
      return text;
    }

    _localizeLowerCased(text: string) {
      return text ? getTranslation(text.split(' ').join('_').toLowerCase()) : '';
    }

    _singularLocalized(text: string) {
      return getTranslation(text).substring(0, text.length - 1);
    }

    _withDefault(value: any, defaultValue: any = '...') {
      if (pdListStatuses[value] !== undefined) {
        return getTranslation(pdListStatuses[value]);
      }

      return value == null ? defaultValue : value;
    }

    _withDefaultFrom(obj: any, key: string, defaultValue: any = '...') {
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

    _capitalizeFirstLetter(text: string, translate?: boolean) {
      if (translate) {
        return getTranslation(text);
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
      const defer: any = {};
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

    _withDefaultParams(queryParams: any) {
      return {...queryParams, page: 1, page_size: 10};
    }

    _appendQuery(url: string, ...theRestOfArgs: any[]) {
      if (url === undefined) {
        return;
      }

      return url + '?' + buildQuery(theRestOfArgs);
    }

    _cloneNode(node: HTMLElement, restores?: any) {
      // Can be used to restore functionality of copied nodes after inserted in dom.
      if (!restores) {
        restores = {};
      }

      const clone = this.deepClone(node, restores);
      for (const prop in node) {
        if (Object.prototype.hasOwnProperty.call(node, prop)) {
          try {
            clone[prop] = node[prop];
          } catch (err) {
            // catch
          }
        }
      }

      return clone;
    }

    disableLifecycleMethods(element: Node) {
      const render = element.constructor.prototype.render;
      const update = element.constructor.prototype.update;
      const createRenderRoot = element.constructor.prototype.createRenderRoot;
      const connectedCallback = element.constructor.prototype.connectedCallback;
      const disconnectedCallback = element.constructor.prototype.disconnectedCallback;

      // Override lifecycle methods to prevent execution
      element.constructor.prototype.update = function () {
        // Skip execution
      };
      element.constructor.prototype.render = function () {
        // Skip execution
      };
      element.constructor.prototype.createRenderRoot = function () {
        // Skip execution
      };
      element.constructor.prototype.connectedCallback = function () {
        // Skip execution
      };
      element.constructor.prototype.disconnectedCallback = function () {
        // Skip execution
      };

      // Restore original lifecycle methods when needed
      return () => {
        element.constructor.prototype.update = update;
        element.constructor.prototype.render = render;
        element.constructor.prototype.createRenderRoot = createRenderRoot;
        element.constructor.prototype.connectedCallback = connectedCallback;
        element.constructor.prototype.disconnectedCallback = disconnectedCallback;
      };
    }

    // Transform CSSStyleSheet rules into HTMLStyleElement
    cloneCSSStyleSheet(styleSheet: CSSStyleSheet): any[] {
      const rules = Array.from(styleSheet.cssRules);
      const styleElements: any[] = [];
      for (const rule of rules) {
        const style = document.createElement('style');
        style.innerText = rule.cssText;
        styleElements.push(style);
      }

      return styleElements;
    }

    deepClone(node: Node, restores: any): Node {
      if (!(node instanceof Element)) {
        // If the node is not an Element, just clone it directly
        return node.cloneNode(false);
      }

      // For all nodes that have renderRoot (ShoelaceElement) we need to disable execution of rendering
      // We are cloning nodes just how they were rendered so we don't need them to execute again.
      // Keeping all restore functions in an object to restore functionality
      // once the new node is generated and inserted in dom.
      if (node instanceof LitElement || node.hasOwnProperty('renderRoot')) {
        const name = node.constructor.name || node.tagName;
        if (!restores.hasOwnProperty(name)) {
          restores[name] = this.disableLifecycleMethods(node);
        }
      }

      // Shallow copy of dom element
      const clone = node.cloneNode(false) as Element;

      // If there are any adopted stylesheet we take them and instert as child style elements
      if ((node as any).adoptedStyleSheets) {
        clone.prepend(...(node as any).adoptedStyleSheets.map((x) => this.cloneCSSStyleSheet(x)).flat());
      }

      // If the node is an Element and has a shadow root, we need to handle it separately
      if (node instanceof Element && node.shadowRoot) {
        // Create a new shadow root on the cloned element
        const shadowClone = clone.attachShadow({mode: 'open'});

        // Recursively clone each child of the shadow root and append to the cloned shadow root
        node.shadowRoot.childNodes.forEach((child) => {
          shadowClone.appendChild(this.deepClone(child, restores));
        });

        // If there are any adopted stylesheet we take them and insert as child style elements
        if ((node.shadowRoot as any).adoptedStyleSheets) {
          shadowClone.prepend(
            ...(node.shadowRoot as any).adoptedStyleSheets.map((x) => this.cloneCSSStyleSheet(x)).flat()
          );
        }
      }

      // Recursively clone and append children of the original node
      if (!(node instanceof ShadowRoot)) {
        node.childNodes.forEach((child) => {
          clone.appendChild(this.deepClone(child, restores));
        });
      }

      return clone;
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

    _prop(obj: any, key: string) {
      return obj[key];
    }

    _omit(src: any, keys: string[]) {
      return Object.keys(src)
        .filter((key) => !keys.includes(key))
        .reduce((acc, key) => {
          acc[key] = src[key];
          return acc;
        }, {} as any);
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
