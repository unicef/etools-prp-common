import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import './etools-prp-number';
import {modalStyles} from '../styles/modal-styles';

/**
 * @customElement
 */
@customElement('calculation-methods-demo-periods')
export class CalculationMethodsDemoPeriods extends LitElement {
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
          background: var(--paper-grey-200);
        }

        .bold-text {
          font-weight: bold;
          font-size: 1.17em;
        }       
        .space-bt {  
          justify-content: space-between !important;
        }
      </style>

        <div class="row">
          ${(this.totals || []).map(
            (item: any) =>
              html`
                  <div class="col-6 content-box">
                    ${item ? html`
                      <div class="bold-text">Reporting period ${item.id}</div>
                      <div class="layout-horizontal space-bt">
                        <div>progress in reporting period</div>
                        <etools-prp-number class="bold-text" value="${item.value}"></etools-prp-number>
                      </div>`: html``
                    }
                  </div>
              `
          )}
        </div>
    `;
  }

  @property({type: Array})
  totals!: any[];

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('totals') && this.totals) {      
      if(this.totals.length % 2 !== 0) {
        this.totals.push(null);
        this.requestUpdate();
      }
    }
  }
}


export {CalculationMethodsDemoPeriods as CalculationMethodsDemoPeriodsEl};
