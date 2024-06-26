import {LitElement, html} from 'lit';
import {property} from 'lit/decorators.js';
import '@polymer/paper-input/paper-input';
import {PaperInputElement} from '@polymer/paper-input/paper-input';
import DisaggregationFieldMixin from '../../mixins/disaggregation-field-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {GenericObject} from '../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin DisaggregationFieldMixin
 */
class DisaggregationField extends DisaggregationFieldMixin(LitElement) {
   render() {
    // language=HTML
    return html`
      <style>
        :host {
          display: block;

          --paper-input-container: {
            padding: 0;
          }

          --paper-input-container-input: {
            font-size: 13px;
          }

          --paper-input-container-input-webkit-spinner: {
            display: none;
          }
        }
      </style>

      <paper-input
        id="field"
        .value="${this.value}"
        allowed-pattern="^\\d*\\.?\\d*$"
        .invalid="${this.invalid}"
        .validator="${this.validator}"
        .min="${this.min}"
        on-value-changed="${this._inputValueChanged}"
        on-keydown="${this._preventInvalidInput}"
        no-label-float
        required
      >
      </paper-input>
    `;
  }

  @property({type: String})
  key!: string;

  @property({type: String})
  coords!: string;

  @property({type: String})
  validator!: string;

  @property({type: Number})
  min!: number;

  @property({type: Number})
  value = 0;

  @property({type: Boolean})
  invalid!: boolean;

  connectedCallback() {
    super.connectedCallback();

    (this.$.field as PaperInputElement).validate();
    fireEvent(this, 'register-field', this);
  }

  validate() {
    return (this.$.field as PaperInputElement).validate();
  }

  getField() {
    return this.$.field;
  }

  _inputValueChanged(e: CustomEvent) {
    const change: GenericObject = {};
    change[this.key] = (e.target as any).value;

    fireEvent(this, 'field-value-changed', {
      key: this.coords,
      value: this._toNumericValues(change)
    });
  }

  _preventInvalidInput(e: KeyboardEvent) {
    if (e.key == '.') {
      if ((e.target as PaperInputElement).value!.indexOf('.') > -1) {
        e.preventDefault();
      }
    }
  }
}

window.customElements.define('disaggregation-field', DisaggregationField);

export {DisaggregationField as DisaggregationFieldEl};
