import {LitElement, html} from 'lit';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import './calculation-methods-demo-modal';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {openDialog} from '@unicef-polymer/etools-utils/src/dialog.util';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {tableStyles} from '../styles/table-styles';
import {customElement} from 'lit/decorators.js';

/**
 * @customElement
 */
@customElement('calculation-methods-info-bar')
export class CalculationMethodsInfoBar extends LitElement {
  render() {
    return html`
      ${tableStyles}
      <style>
        ${layoutStyles} :host {
          display: block;
          background: #fcfcfc;
          padding: 16px;
          margin-bottom: 25px;
        }

        etools-icon {
          color: var(--sl-color-neutral-600);
          margin-right: 5px;
        }

        span {
          color: var(--sl-color-neutral-600);
        }

        .buttons {
          margin: 1em 0;
        }
        .space-bt {
          justify-content: space-between !important;
        }
      </style>
      <div class="layout-horizontal center-align space-bt">
        <div class="layout-horizontal center-align">
          <etools-icon id="information-icon" name="info"></etools-icon>
          <span>${translate('TO_HELP_YOU_DECIDE')}:</span>
        </div>
        <div>
          <etools-button id="locations" variant="text" @click="${this._openLocationsModal}">
            ${translate('ACROSS_LOCATIONS')}
          </etools-button>

          <etools-button id="periods" variant="text" @click="${this._openPeriodsModal}">
            ${translate('ACROSS_REPORTING_PERIODS')}
          </etools-button>
        </div>
      </div>
    `;
  }

  _openLocationsModal() {
    openDialog({
      dialog: 'calculation-methods-demo-modal',
      dialogData: {
        domain: 'locations',
        items: 3
      }
    });
  }

  _openPeriodsModal() {
    openDialog({
      dialog: 'calculation-methods-demo-modal',
      dialogData: {
        domain: 'reporting periods',
        items: 2
      }
    });
  }
}

export {CalculationMethodsInfoBar as CalculationMethodsInfoBarEl};
