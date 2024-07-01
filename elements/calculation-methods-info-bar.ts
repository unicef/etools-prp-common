import {LitElement, html} from 'lit';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-button/paper-button';
import './calculation-methods-demo-modal';
import {CalculationMethodsDemoModalEl} from './calculation-methods-demo-modal';
import LocalizeMixin from '../mixins/localize-mixin';
import {buttonsStyles} from '../styles/buttons-styles';
import {tableStyles} from '../styles/table-styles';
import {customElement} from 'lit/decorators.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
@customElement('calculation-methods-info-bar')
export class CalculationMethodsInfoBar extends LocalizeMixin(LitElement) {
  render() {
    return html`
      ${buttonsStyles} ${tableStyles}
      <style include="data-table-styles iron-flex iron-flex-alignment iron-flex-reverse">
        :host {
          display: block;
          background: #fcfcfc;
          padding: 16px;
          margin-bottom: 25px;
        }

        iron-icon {
          color: var(--paper-grey-600);
        }

        span {
          color: var(--paper-grey-600);
        }

        iron-icon {
          margin-right: 5px;
        }

        .buttons {
          margin: 1em 0;
        }
      </style>
      <div class="layout horizontal justified center-aligned">
        <div class="layout horizontal center-center">
          <iron-icon icon="icons:info"></iron-icon>
          <span>${this.localize('to_help_you_decide')}:</span>
        </div>
        <div>
          <paper-button id="locations" on-tap="_openLocationsModal" class="btn-primary">
            ${this.localize('across_locations')}
          </paper-button>

          <paper-button id="periods" on-tap="_openPeriodsModal" class="btn-primary">
            ${this.localize('across_reporting_periods')}
          </paper-button>
        </div>
      </div>
      <calculation-methods-demo-modal id="locations-modal" domain="locations" items="3">
      </calculation-methods-demo-modal>
      <calculation-methods-demo-modal id="periods-modal" domain="reporting periods" items="2">
      </calculation-methods-demo-modal>
    `;
  }

  _openLocationsModal() {
    (this.shadowRoot!.querySelector('#locations-modal') as CalculationMethodsDemoModalEl).open();
  }

  _openPeriodsModal() {
    (this.shadowRoot!.querySelector('#periods-modal') as CalculationMethodsDemoModalEl).open();
  }
}

export {CalculationMethodsInfoBar as CalculationMethodsInfoBarEl};
