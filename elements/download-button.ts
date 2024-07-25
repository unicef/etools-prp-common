import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
/**
 * @polymer
 * @customElement
 */
@customElement('download-button')
export class DownloadButton extends MatomoMixin(LitElement) {
  render() {
    return html`
      <a href="${this.url}" tabindex="-1" target="_blank" tracker="${this.tracker}" @click="${this.trackAnalytics}">
        <etools-button variant="text" @click="${this.clickedComplete}">
          <etools-icon name="file-download"></etools-icon>
          <slot></slot>
        </etools-button>
      </a>
    `;
  }

  @property({type: String})
  url!: string;

  @property({type: String})
  tracker!: string;

  clickedComplete(e: any) {
    e.target.blur();
  }
}
