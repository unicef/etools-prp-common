import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
declare const numeral: any;

/**
 * @polymer
 * @customElement
 */
@customElement('numeral-js')
export class NumeralJs extends LitElement {
  render() {
    return this.print ? html`${this.output}` : ``;
  }

  // Input number
  @property({type: Number})
  number!: number;

  // Formatted manipulated output
  @property({type: String})
  output = '';

  // Print output
  @property({type: Boolean})
  print = false;

  // Format of output.
  @property({type: String})
  format!: string;

  // Custom Zero Formatting. Set a custom output when formatting numerals with a value of 0.
  @property({type: String})
  zeroFormat!: string;

  //  Un-format the value
  @property({type: String})
  unformat!: string;

  // The add function will be executed with the given number to this parameter.
  @property({type: Number})
  add!: number;

  // The subtract function will be executed with the given number to this parameter.
  @property({type: Number})
  subtract!: number;

  // The multiply function will be executed with the given number to this parameter.
  @property({type: Number})
  multiply!: number;

  // The divide function will be executed with the given number to this parameter
  @property({type: Number})
  divide!: number;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
  
    if (changedProperties.has('number')) {
      this._numberChanged();
    }
    if (changedProperties.has('format')) {
      this._formatChanged();
    }
    if (changedProperties.has('zeroFormat')) {
      this._zeroFormatChanged();
    }
    if (changedProperties.has('unformat')) {
      this._unformatChanged();
    }
    if (changedProperties.has('add')) {
      this._add();
    }
    if (changedProperties.has('subtract')) {
      this._subtract();
    }
    if (changedProperties.has('multiply')) {
      this._multiply();
    }
    if (changedProperties.has('divide')) {
      this._divide();
    }
  }

  _numberChanged() {
    this._format();
  }

  _formatChanged() {
    this._format();
  }

  _format() {
    if (this.format) {
      // @ts-ignore _setOutput defined by polymer / 'output' prop is readonly
      this._setOutput(numeral(this.number).format(this.format));
    } else {
      // @ts-ignore _setOutput defined by polymer / 'output' prop is readonly
      this._setOutput(this.number);
    }
  }

  _zeroFormatChanged() {
    numeral.zeroFormat(this.zeroFormat);
    this._format();
  }

  _unformatChanged() {
    // @ts-ignore _setOutput defined by polymer / 'output' prop is readonly
    this._setOutput(numeral().unformat(this.unformat));
  }

  _add() {
    this.number = numeral(this.number).add(this.add).value();
  }

  _subtract() {
    this.number = numeral(this.number).subtract(this.subtract).value();
  }

  _multiply() {
    this.number = numeral(this.number).multiply(this.multiply).value();
  }

  _divide() {
    this.number = numeral(this.number).divide(this.divide).value();
  }
}

export {NumeralJs as NumeralJsEl};
