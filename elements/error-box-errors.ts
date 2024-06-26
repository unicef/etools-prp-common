import {LitElement, html} from 'lit';
import {property} from 'lit/decorators.js';
import {GenericObject} from '../typings/globals.types';

/**
 * @polymer
 * @customElement
 */
class ErrorBoxErrors extends LitElement {
  render() {
    return html`
      <style>
        :host {
          display: block;
        }

        ul {
          padding-left: 2em;
          margin: 0;
          font-size: 12px;
        }
      </style>

      <ul>
        ${(this.errors || [].map((error: any) => html`        
          <li>
            ${error.field ? html`<span>${error.field}:</span>` : ``}
            ${error.value ? html`<span>${error.value}:</span>` : ``}
            ${error.details ? html`<error-box-errors .errors="${error.details}"> </error-box-errors>` : ``}
          </li>
        `))}
      </ul>
    `;
  }

  @property({type: Object})
  errors!: GenericObject;
}

window.customElements.define('error-box-errors', ErrorBoxErrors);
