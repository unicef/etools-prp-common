import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

/**
 * @customElement
 */
@customElement('error-box-errors')
export class ErrorBoxErrors extends LitElement {
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
        ${this.errors ||
        [].map(
          (error: any) => html`
            <li>
              ${error.field ? html`<span>${error.field}:</span>` : ``}
              ${error.value ? html`<span>${error.value}:</span>` : ``}
              ${error.details ? html`<error-box-errors .errors="${error.details}"> </error-box-errors>` : ``}
            </li>
          `
        )}
      </ul>
    `;
  }

  @property({type: Object})
  errors!: any;
}

