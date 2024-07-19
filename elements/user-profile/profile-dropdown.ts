import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import './user-profile-dialog';
import UtilsMixin from '../../mixins/utils-mixin';
import {translate} from 'lit-translate';

@customElement('profile-dropdown')
export class ProfileDropdown extends UtilsMixin(LitElement) {
  @property({type: String, reflect: true})
  dropdownOpened = '';

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      width: 60px;
      height: 60px;
    }
    :host([dropdownOpened='open']) {
      background: var(--primary-background-color, #ffffff);
    }
    :host([dropdownOpened='open']) #profile,
    #accountProfile,
    #powerSettings {
      color: var(--dark-secondary-text-color, rgba(0, 0, 0, 0.54));
    }
    #profile {
      color: var(--header-secondary-text-color, rgba(255, 255, 255, 0.7));
    }
    .dropdown-content {
      position: absolute;
      top: 60px;
      z-index: 100;
      background: var(--primary-background-color, #ffffff);
      padding: 8px 0;
      right: 0px;
    }
    .dropdown-content .item {
      display: flex;
      align-items: center;
      height: 48px;
      font-size: 16px;
      color: rgba(0, 0, 0, 0.87);
      padding: 0 16px 0 8px;
      cursor: pointer;
      white-space: nowrap;
    }
    .dropdown-content .item:hover {
      background: var(--medium-theme-background-color, #eeeeee);
    }
  `;

  render() {
    return html`
      <user-profile-dialog id="userProfileDialog"></user-profile-dialog>
      <paper-icon-button
        id="profile"
        icon="social:person"
        role="button"
        @click=${this._handleTap}
        aria-disabled="false"
      ></paper-icon-button>
      <iron-collapse .opened=${this.dropdownOpened === 'open'}>
        <div class="paper-material dropdown-content" elevation="5" id="user-dropdown">
          <div class="item" @click=${this._openModal}>
            <paper-icon-button id="accountProfile" icon="account-circle"></paper-icon-button>
            ${translate('PROFILE')}
          </div>
          <div class="item" @click=${this._logout}>
            <paper-icon-button id="powerSettings" icon="power-settings-new"></paper-icon-button>
            ${translate('SIGN_OUT')}
          </div>
        </div>
      </iron-collapse>
    `;
  }

  _logout() {
    fireEvent(this, 'sign-out');
  }

  _openModal() {
    this._handleTap();
    (this.shadowRoot!.getElementById('userProfileDialog') as any).open();
  }

  _handleTap() {
    this.dropdownOpened = this.dropdownOpened === '' ? 'open' : '';
  }
}
