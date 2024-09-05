import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import '@unicef-polymer/etools-unicef/src/etools-radio/etools-radio-group';
import '@shoelace-style/shoelace/dist/components/radio/radio.js';
import UtilsMixin from '../mixins/utils-mixin';
import {store} from '../../redux/store';

/**
 * @appliesMixin UtilsBehavior
 */
@customElement('calculation-method')
export class CalculationMethod extends connect(store)(UtilsMixin(LitElement)) {
  render() {
    return html`
      <style>
        :host {
          display: block;
        }

        etools-radio-group {
          margin-left: -12px;
        }

        sl-radio,
        .read-only-label {
          text-transform: uppercase;
        }

        .read-only-label {
          display: inline-block;
          padding: 12px 0;
          line-height: 16px;
          color: var(--theme-secondary-text-color);
        }
      </style>

      ${this.readonly
        ? html`<span class="read-only-label">${this._localizeLowerCased(this.readOnlyLabel)}</span>`
        : html`<etools-radio-group .value="${this.value}">
      ${(this.choices || []).map(
        (item: any) =>
          html`<sl-radio class="${this.disabled ? 'readonly' : ''}" name="${item.id}">
            ${this._localizeLowerCased(item.title)}</sl-radio
          >`
      )}
        </<etools-radio-group>`}
    `;
  }

  @property({type: Boolean})
  disabled = false;

  @property({type: Boolean})
  readonly = false;

  @property({type: String})
  value!: string;

  @property({type: Array})
  choices = [
    {
      id: 'sum',
      title: 'Sum'
    },
    {
      id: 'max',
      title: 'Max'
    },
    {
      id: 'avg',
      title: 'Avg'
    }
  ];

  @property({type: String})
  readOnlyLabel!: string;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('value') || changedProperties.has('choices')) {
      this.readOnlyLabel = this._computeReadonlyLabel(this.value, this.choices);
    }
  }

  _computeReadonlyLabel(value: any, choices: any[]) {
    const method = choices.find(function (choice) {
      return choice.id === value;
    });

    return method ? method.title : 'Invalid method';
  }

  // TODO: Might also need validation at some point
}

export {CalculationMethod as CalculationMethodEl};
