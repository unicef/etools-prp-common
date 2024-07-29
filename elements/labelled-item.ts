
import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {sharedStyles} from '../styles/shared-styles';

/**
 * @customElement
 */
@customElement('labelled-item')
export class LabelledItem extends LitElement {
   render() {
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          position: relative;
        }

        .labelled-item {
          margin: 0;
        }

        .labelled-item__label {
          font-size: 12px;
          color: #737373;
          display: block;
          @apply --labelled-item-label;
          @apply --truncate;
        }

        .labelled-item__content {
          margin: 0;
        }

        .error {
          color: var(--paper-deep-orange-a700);
        }

        ::slotted(.field-value) {
          font-size: 16px;
        }
      </style>

      <dl class="labelled-item">
        <dt class="labelled-item__label ${this.labelClassName}">${this.label}</dt>
        <dd class="labelled-item__content">
          <slot></slot>
        </dd>
      </dl>
    `;
  }

  @property({type: String})
  label!: string;

  @property({type: Boolean})
  invalid = false;

  @property({type: String})
  labelClassName!: string;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('invalid')) {
      this.labelClassName = this._computeLabelClassName(this.invalid);
    }
  }

  _computeLabelClassName(invalid: boolean) {
    return invalid ? 'error' : '';
  }
}

export {LabelledItem as LabelledItemEl};
