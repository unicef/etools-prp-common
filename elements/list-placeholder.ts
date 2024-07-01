// @ts-nocheck
import { LitElement, html } from 'lit';
import {customElement, property} from 'lit/decorators.js';
import LocalizeMixin from '../mixins/localize-mixin';

@customElement('list-placeholder')
export class ListPlaceholder extends LocalizeMixin(LitElement) {
  render() {
    return html`
      <style>
        .msg {
          text-align: center;
          padding: 1em 0;
        }
      </style>

      <div class="msg">${this.getMessageToDisplay(this.localize)}</div>
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

  getMessageToDisplay(localize: any) {
    return this.message ? this.message : localize('no_results_found');
  }
}

export {ListPlaceholder as ListPlaceholderEl};
