import {LitElement, html} from 'lit';

/**
 * @polymer
 * @customElement
 */
class PageBody extends LitElement {
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

window.customElements.define('page-body', PageBody);
