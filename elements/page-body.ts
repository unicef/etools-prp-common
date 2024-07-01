import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';

/**
 * @polymer
 * @customElement
 */
@customElement('page-body')
export class PageBody extends LitElement {
  render() {
    return html`
      <style>
        :host {
          display: block;
          padding: 25px 25px 75px;
        }
      </style>
      <slot><slot> </slot></slot>
    `;
  }
}

export{PageBody as PageBodyEl};
