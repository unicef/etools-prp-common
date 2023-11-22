import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-button/paper-button';
import {property} from '@polymer/decorators/lib/decorators';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';

/**
 * @polymer
 * @customElement
 */
class DownloadButton extends MatomoMixin(PolymerElement) {
  public static get template() {
    return html`
      <style>
        a {
          text-decoration: none;
          color: var(--theme-primary-color);
        }
      </style>

      <a href="[[url]]" tabindex="-1" target="_blank" tracker$="[[tracker]]" on-click="trackAnalytics">
        <paper-button class="btn-primary" on-focusin="clickedComplete">
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

window.customElements.define('download-button', DownloadButton);
