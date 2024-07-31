// @ts-nocheck
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {translate} from 'lit-translate';

@customElement('list-placeholder')
export class ListPlaceholder extends LitElement {
  render() {
    return html`
      <style>
        .msg {
          text-align: center;
          padding: 1em 0;
        }
      </style>

      <div class="msg">${this.getMessageToDisplay()}</div>
    `;
  }

  @property({type: Array})
  data = [];

  @property({type: Boolean})
  loading = false;

  @property({type: String})
  message!: string;

  @property({type: Boolean, reflect: true})
  hidden!: boolean;

  @property({type: Boolean, reflect: true})
  ariaHidden!: boolean;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('data') || changedProperties.has('loading')) {
      this.hidden = this._computeHidden(this.data, this.loading);
    }
    if (changedProperties.has('hidden')) {
      this.ariaHidden = this._computeAriaHidden(this.hidden);
    }
  }

  _computeHidden(data: any[], loading: boolean) {
    return loading || (data && !!data.length);
  }

  _computeAriaHidden(hidden: boolean) {
    return hidden ? 'true' : 'false';
  }

  getMessageToDisplay() {
    return this.message ? this.message : translate('NO_RESULTS_FOUND');
  }
}

export {ListPlaceholder as ListPlaceholderEl};
