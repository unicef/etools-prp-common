import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-button/paper-button';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';

/**
 * @polymer
 * @customElement
 */
@customElement('download-button')
export class DownloadButton extends MatomoMixin(LitElement) {
  render() {
    return html`
      <style>
        a {
          text-decoration: none;
          color: var(--theme-primary-color);
        }
      </style>

      <a href="${this.url}" tabindex="-1" target="_blank" tracker="${this.tracker}" @click="${this.trackAnalytics}">
        <paper-button class="btn-primary" @focusin="${this.clickedComplete}">
          <iron-icon icon="icons:file-download"></iron-icon>
          <slot></slot>
        </paper-button>
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
