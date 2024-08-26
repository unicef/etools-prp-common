import {html, LitElement, PropertyValues} from 'lit';
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

  @property({type: String})
  errMessage!: string;

  @property({type: Boolean, attribute: 'validate-sibling'})
  validateSibling = false;

  @property({type: Number})
  min!: number;

  @property({type: Number})
  value = 0;

  @property({type: Boolean})
  invalid!: boolean;

  render() {
    return html`
      <style>
        :host {
          display: block;
        }
        etools-input::part(input) {
          text-align: center;
        }
        etools-input {
          --etools-input-padding-top: 0 !important;
          --etools-input-padding-bottom: 0 !important;
        }
      </style>
      <etools-input
        id="field"
        .value="${this.value}"
        allowed-pattern="^\\d*\\.?\\d*$"
        ?invalid="${this.invalid}"
        .min="${this.min}"
        @value-changed="${this._inputValueChanged}"
        @keydown="${this._preventInvalidInput}"
        .errorMessage="${this.errMessage}"
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

    this.errMessage = '';
    fireEvent(this, 'register-field', this);

    setTimeout(() => {
      if (!this.value && isNaN(Number(this.value))) {
        // fill with 0 by default if no value is set
        const field = this.getField();
        if (field) {
          field.value = 0;
          this._inputValueChanged({target: field as any} as CustomEvent, false);
          this.value = 0;
        }
      }
    }, 20);
    // this.validate();
  }

  validate() {
    const field = this.getField() as EtoolsInput;
    const isValid = field.validate() && this._validateByValidator(field.value);
    this.invalid = !isValid;
    this.requestUpdate();
    return isValid;
  }

  getField() {
    return this.shadowRoot!.getElementById('field') as EtoolsInput;
  }

  _inputValueChanged(e: CustomEvent, applyValidation = true) {
    const change: any = {};
    const currentValue = (e.target as EtoolsInput).value;
    change[this.key] = currentValue;

    if (applyValidation) {
      this._validateByValidator(currentValue);
    }

    fireEvent(this, 'field-value-changed', {
      key: this.coords,
      value: this._toNumericValues(change)
    });
  }

  _validateByValidator(currentValue: string | number | null) {
    if (this.validateSibling) {
      try {
        const siblingEl = this._getSiblingEl();
        if (siblingEl) {
          const isValid = Number(currentValue) !== 0 || Number((siblingEl as EtoolsInput).value) === 0;
          this.invalid = !isValid;
          return isValid;
        }
      } catch (err) {
        console.log('_validateByValidator', err);
      }
    }
    return true;
  }

  _getSiblingEl() {
    let parentEl = this.parentElement;
    while (parentEl && !parentEl.classList.contains('item-parent')) {
      parentEl = parentEl.parentElement;
    }
    if (parentEl) {
      const disaggEl = parentEl.querySelector('.item-v')!.querySelector('disaggregation-field') as DisaggregationField;
      if (disaggEl) {
        return disaggEl.getField();
      }
    }
    return null;
  }

  _preventInvalidInput(e: KeyboardEvent) {
    if (e.key === '.' && (e.target as EtoolsInput).value!.toString()?.indexOf('.') > -1) {
      e.preventDefault();
    }
  }
}

export {DisaggregationField as DisaggregationFieldEl};
