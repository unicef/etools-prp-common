import {connect} from 'pwa-helpers/connect-mixin';
import {store} from '../../../redux/store';
import UtilsMixin from '../../mixins/utils-mixin';
import RoutingMixin from '../../mixins/routing-mixin';

import '@polymer/app-layout/app-grid/app-grid-style.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-styles/typography.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '../labelled-item';
import {modalStyles} from '../../styles/modal-styles';
import {customElement, property} from 'lit/decorators.js';
import {LitElement, html} from 'lit';
import {RootState} from '../../../typings/redux.types';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin RoutingMixin
 */
@customElement('user-profile-dialog')
class UserProfileDialog extends RoutingMixin(UtilsMixin(connect(store)(LitElement))) {
  @property({type: Boolean})
  opened = false;

  @property({type: Object})
  profile: any = {};

  @property({type: Array})
  prpRoles = [];

  @property({type: String})
  portal = '';

  render() {
    return html`
      ${modalStyles}
      <style>
        :host {
          display: block;
          --app-grid-columns: 3;
          --app-grid-gutter: 15px;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 3;
          --paper-dialog: {
            width: 700px;
          }
        }
        .full-width {
          grid-column: span 3;
        }
        .header {
          height: 48px;
          padding: 0 24px;
          margin: 0;
          color: white;
          background: var(--theme-primary-color, #0099ff);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header h2 {
          margin: 0;
          line-height: 48px;
          font-family: var(--paper-font-title_-_font-family);
          -webkit-font-smoothing: var(--paper-font-title_-_-webkit-font-smoothing);
          font-size: var(--paper-font-title_-_font-size);
          font-weight: var(--paper-font-title_-_font-weight);
          letter-spacing: var(--paper-font-title_-_letter-spacing);
          line-height: var(--paper-font-title_-_line-height);
        }
        .clusters {
          margin: 0;
        }
        .clusters dt,
        .clusters dd {
          display: inline;
          margin: 0;
        }
        .clusters dd::after {
          content: 'A';
          white-space: pre;
        }
        .caption {
          font-family: var(--paper-font-caption_-_font-family);
          -webkit-font-smoothing: var(--paper-font-caption_-_-webkit-font-smoothing);
          font-size: var(--paper-font-caption_-_font-size);
          font-weight: var(--paper-font-caption_-_font-weight);
          letter-spacing: var(--paper-font-caption_-_letter-spacing);
          line-height: var(--paper-font-caption_-_line-height);
          color: var(--secondary-text-color);
        }
        hr {
          color: #737373;
          margin-top: 5px;
          opacity: 1;
        }
      </style>
      <paper-dialog id="userProfileDialog" ?opened=${this.opened} with-backdrop>
        <div class="header layout horizontal justified">
          <h2>My Profile</h2>
          <paper-icon-button class="self-center" @click=${this.close} icon="icons:close"></paper-icon-button>
        </div>
        <paper-dialog-scrollable>
          <iron-form class="app-grid">
            <div class="full-width">
              <paper-input
                label="First Name"
                .value=${this.profile?.first_name}
                placeholder="---"
                readonly
                always-float-label
              ></paper-input>
            </div>
            <div class="full-width">
              <paper-input
                label="Last Name"
                .value=${this.profile?.last_name}
                placeholder="---"
                readonly
                always-float-label
              ></paper-input>
            </div>
            <div class="full-width">
              <paper-input
                label="Email"
                .value=${this.profile?.email}
                placeholder="---"
                readonly
                always-float-label
              ></paper-input>
            </div>
            <div class="full-width">
              <div class="caption">My roles</div>
              ${(this.prpRoles || []).map((role) => html`<div>${role}</div>`)}
              <hr />
            </div>
            ${this.profile?.partner
              ? html` <div class="full-width">
                  <paper-input
                    label="Partner"
                    .value=${this.profile?.partner?.title}
                    placeholder="---"
                    readonly
                    always-float-label
                  ></paper-input>
                </div>`
              : ''}
            ${this.profile?.organization
              ? html` <div class="full-width">
                  <paper-input
                    label="My Organization"
                    .value=${this.profile?.organization || '---'}
                    placeholder="---"
                    readonly
                    always-float-label
                  ></paper-input>
                </div>`
              : ''}
          </iron-form>
        </paper-dialog-scrollable>
      </paper-dialog>
    `;
  }

  close() {
    this.opened = false;
  }

  open() {
    this.opened = true;
  }

  updated(changedProperties) {
    if (changedProperties.has('profile') || changedProperties.has('portal')) {
      this.prpRoles = this._computePrpRoles(this.profile, this.portal);
    }
  }

  stateChanged(rootState: RootState): void {
    if (rootState?.userProfile?.profile) {
      this.profile = rootState.userProfile.profile;
    }

    if (rootState?.app?.current) {
      this.portal = rootState.app.current;
    }
  }

  _computePrpRoles(profile, portal) {
    if (!profile) {
      return [];
    }
    return (profile.prp_roles || []).map((role) => {
      let result = '';

      if (role.cluster && portal === 'cluster-reporting') {
        result += role.cluster.full_title;
      } else if (role.workspace) {
        result += role.workspace.title;
      }

      if (result) {
        result += ' / ';
      }

      return result + role.role_display;
    });
  }
}

export {UserProfileDialog as UserProfileDialogEl};
