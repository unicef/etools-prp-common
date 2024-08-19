import {html, css, LitElement, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {EtoolsInput} from '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import DisaggregationFieldMixin from '../../mixins/disaggregation-field-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';

@customElement('disaggregation-field')
export class DisaggregationField extends DisaggregationFieldMixin(LitElement) {
  @property({type: String})
  key!: string;

  @property({type: String})
  coords!: string;

  @property({type: Object})
  validatorEl!: DisaggregationField;

  @property({type: Number})
  min!: number;

  @property({type: Number})
  value = 0;

  @property({type: Boolean})
  invalid!: boolean;

  static styles = css`
    :host {
      display: block;
    }
    etools-input::part(input) {
      text-align: center;
    }
  `;

  render() {
    return html`
      <etools-input
        id="field"
        .value="${this.value}"
        allowed-pattern="^\\d*\\.?\\d*$"
        ?invalid="${this.invalid}"
        .min="${this.min}"
        @value-changed="${this._inputValueChanged}"
        @keydown="${this._preventInvalidInput}"
        no-label-float
        required
      >
      </etools-input>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  protected firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);

    // this.validate();
    // fireEvent(this, 'register-field', this);
  }

  validate() {
    return (this.shadowRoot!.getElementById('field') as EtoolsInput).validate();
  }

  getField() {
    return this.shadowRoot!.getElementById('field');
  }

  _inputValueChanged(e: CustomEvent) {
    const change: any = {};
    change[this.key] = (e.target as EtoolsInput).value;

    if (this.validatorEl) {
      const isValid = change[this.key] !== 0 || Number(this.validatorEl.getField() as EtoolsInput) === 0;
      (this.getField() as EtoolsInput).invalid = !isValid;
    }

    fireEvent(this, 'field-value-changed', {
      key: this.coords,
      value: this._toNumericValues(change)
    });
  }

  _preventInvalidInput(e: KeyboardEvent) {
    if (e.key === '.' && (e.target as EtoolsInput).value!.toString()?.indexOf('.') > -1) {
      e.preventDefault();
    }
  }
}

export {DisaggregationField as DisaggregationFieldEl};
