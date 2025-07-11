import {LitElement} from 'lit';
import {Constructor} from '../typings/globals.types';
import {get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';

/**
 * @mixinFunction
 */
function UtilsMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class UtilsClass extends baseClass {
    _localizeLowerCased(text: string) {
      return text ? getTranslation(text.split(' ').join('_').toLowerCase()) : '';
    }

    _singularLocalized(text: string) {
      return getTranslation(text).substring(0, text.length - 1);
    }

    _cloneNode(node: HTMLElement, restores?: any) {
      // Can be used to restore functionality of copied nodes after inserted in dom.
      if (!restores) {
        restores = {};
      }

      const clone = this.deepCloneNode(node, restores);
      for (const prop in node) {
        if (Object.prototype.hasOwnProperty.call(node, prop)) {
          try {
            clone[prop] = node[prop];
          } catch {
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

    deepCloneNode(node: Node, restores: any): Node {
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
          shadowClone.appendChild(this.deepCloneNode(child, restores));
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
          clone.appendChild(this.deepCloneNode(child, restores));
        });
      }

      return clone;
    }
  }

  return UtilsClass;
}

export default UtilsMixin;
