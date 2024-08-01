import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import './etools-prp-number';
import {modalStyles} from '../styles/modal-styles';

/**
 * @customElement
 */
@customElement('calculation-methods-demo-locations')
export class CalculationMethodsDemoLocations extends LitElement {
  static get styles() {
    return [layoutStyles];
  }

  render() {
    return html`
      ${modalStyles}
      <style>
        :host {
          display: block;
        }

        li:last-of-type {
          margin-right: 0;
        }

        .content-box {
          padding: 20px;
          background: var(--sl-color-neutral-200);
        }

        .bold-text {
          font-weight: bold;
          font-size: 1.17em;
        }
      </style>

      <div class="row">
        ${(this.totals || []).map(
          (item: any) =>
            html` <div class="col-12 content-box">
              <div class="bold-text">Location ${item.id}</div>
              <div class="layout-vertical">
                <div>Reporting period</div>
                <etools-prp-number class="bold-text" value="${item.value}"></etools-prp-number>
              </div>
            </div>`
        )}
      </div>
    `;
  }

  @property({type: Array})
  totals!: any[];
}

export {CalculationMethodsDemoLocations as CalculationMethodsDemoLocationsEl};
