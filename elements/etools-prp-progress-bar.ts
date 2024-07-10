import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@polymer/paper-progress/paper-progress';
import UtilsMixin from '../mixins/utils-mixin';
import {progressBarStyles} from '../styles/progress-bar-styles';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
@customElement('etools-prp-progress-bar')
export class EtoolsPrpProgressBar extends UtilsMixin(LitElement) {
  render() {
    return html`
     
      helllo
      <paper-progress .value="${this.percentage}"></paper-progress>
      <span class="percentage">${this.percentage}%</span>
    `;
  }

  @property({type: String})
  displayType = '';

  @property({type: String})
  number = '0';

  @property({type: Number})
  percentage!: number | string;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('number')) {
      this.percentage = this._computePercentage();
    }
  }

  _computePercentage() {
    if (this.number === 'N/A') {
      return 'N/A';
    }

    // round to two decimal places, more info here: https://stackoverflow.com/a/29494612
    return this.displayType === 'percentage'
      ? Math.round(Number(this.number))
      : Math.round(Number(this.number) * 100 * 1e2) / 1e2;
  }
}

export {EtoolsPrpProgressBar as EtoolsPrpProgressBarEl};
