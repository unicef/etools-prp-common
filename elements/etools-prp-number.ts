import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import Constants from '../constants';
import '../elements/numeral-js';

/**
 * @polymer
 * @customElement
 */
@customElement('etools-prp-number')
export class EtoolsPrpNumber extends LitElement {
  render() {
    return html`
      ${this._noValue(this.value)
        ? html`0`
        : html`<numeral-js number="${this.value}" format="${this._finalFormat}" print></numeral-js>`}
    `;
  }

  @property({type: Number})
  value: number | null = null;

  @property({type: String})
  overrideFormat = '';

  @property({type: String})
  _defaultFormat: string = Constants.FORMAT_NUMBER_DEFAULT;

  @property({type: String})
  _finalFormat!: string;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('_defaultFormat') || changedProperties.has('overrideFormat')) {
      this._finalFormat = this._computeFinalFormat(this._defaultFormat, this.overrideFormat);
    }
  }

  _noValue(value: any) {
    return value == null;
  }

  _computeFinalFormat(_defaultFormat: string, overrideFormat: string) {
    return overrideFormat || _defaultFormat;
  }
}

export {EtoolsPrpNumber as EtoolsPrpNumberEl};
