import {LitElement, html} from 'lit';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import './calculation-methods-demo-modal';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import LocalizeMixin from '../mixins/localize-mixin';
import {tableStyles} from '../styles/table-styles';
import {customElement} from 'lit/decorators.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
@customElement('calculation-methods-info-bar')
export class CalculationMethodsInfoBar extends LocalizeMixin(LitElement) {
  static get styles() {
    return [layoutStyles];
  }

  render() {
    return html`
      ${tableStyles}
      <style>
        :host {
          display: block;
          background: #fcfcfc;
          padding: 16px;
          margin-bottom: 25px;
        }

        etools-icon {
          color: var(--paper-grey-600);
          margin-right: 5px;
        }

        span {
          color: var(--paper-grey-600);
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
          <span>${this.localize('to_help_you_decide')}:</span>
        </div>
        <div>
          <etools-button id="locations" variant="text" @click="${this._openLocationsModal}">
            ${this.localize('across_locations')}
          </etools-button>

          <etools-button id="periods"  variant="text" @click="${this._openPeriodsModal}">
            ${this.localize('across_reporting_periods')}
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
