import {LitElement, PropertyValues, html} from 'lit';
import {property} from 'lit/decorators.js';
import '@polymer/paper-progress/paper-progress';
import UtilsMixin from '../mixins/utils-mixin';
import {progressBarStyles} from '../styles/progress-bar-styles';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class EtoolsPrpProgressBar extends UtilsMixin(LitElement) {
  render() {
    return html`
      ${progressBarStyles}
      <style>
        .percentage {
          vertical-align: middle;
          line-height: 15px;
        }
      </style>
      <paper-progress value="[[percentage]]"></paper-progress>
      <span class="percentage">[[percentage]]%</span>
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
      this.percentage = this._computePercentage(this.number);
    }
  }

  _computePercentage(num: string) {
    if (num === 'N/A') {
      return 'N/A';
    }

    // round to two decimal places, more info here: https://stackoverflow.com/a/29494612
    return this.displayType === 'percentage' ? Math.round(Number(num)) : Math.round(Number(num) * 100 * 1e2) / 1e2;
  }
}

window.customElements.define('etools-prp-progress-bar', EtoolsPrpProgressBar);
