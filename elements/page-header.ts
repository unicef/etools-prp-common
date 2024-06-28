import { LitElement, PropertyValues, html } from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import '@polymer/paper-styles/typography';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';

import LocalizeMixin from '../mixins/localize-mixin';
import RoutingMixin from '../mixins/routing-mixin';
import {sharedStyles} from '../styles/shared-styles';
import {store} from '../../redux/store';
import {RootState} from '../../typings/redux.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 * @appliesMixin RoutingMixin
 */
@customElement('page-header')
export class PageHeader extends LocalizeMixin(RoutingMixin(connect(store)(LitElement))) {
  render() {
    return html`
      ${sharedStyles}
      <style include="iron-flex iron-flex-alignment iron-flex-factors">
        :host {
          --header-gutter: 25px;

          display: block;
          padding: var(--header-gutter);

          background: white;
          box-shadow: 0 1px 2px 1px rgba(0, 0, 0, 0.1);

          --paper-icon-button: {
            color: #666;
          }
        }
        .title {
          min-width: 0;
          position: relative;
        }
        .title h1 {
          @apply --paper-font-title;
          @apply --truncate;
          max-width: 100%;
          margin: 0;
        }
        .back-button {
          text-decoration: none;
        }
        ::slotted([slot='above-title']) {
          margin-left: 40px;
        }
        ::slotted([slot='toolbar']) {
          text-align: right;
        }
        ::slotted([slot='tabs']) {
          margin-bottom: -25px;
          text-transform: uppercase;
        }
      </style>

      <div class="layout horizontal baseline">
        <div class="title flex">
          <div class="above-title">
            <slot name="above-title"></slot>
          </div>
          <div class="layout horizontal center">
            ${this.back
              ? html`<a href="${this.backUrl}" class="back-button">
                  <paper-icon-button icon="chevron-left"></paper-icon-button>
                </a>`
              : ``}
            <h1>${this.title}<slot name="in-title"></slot></h1>
          </div>
        </div>

        <div class="toolbar">
          <slot name="toolbar"></slot>
        </div>
      </div>

      <div class="header-content">
        <slot name="header-content"></slot>
      </div>

      <div class="tabs">
        <slot name="tabs"></slot>
      </div>
    `;
  }

  @property({type: String})
  title!: string;

  @property({type: String})
  back!: string;

  @property({type: String})
  backUrl!: string | undefined;

  @property({type: String})
  app!: string;

  stateChanged(state: RootState) {
    if (state?.app?.current) {
      this.app = state.app.current;
    }
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('back') || changedProperties.has('_baseUrl') || changedProperties.has('app')) {
      this.backUrl = this._computeBackUrl(this.back, this._baseUrl, this.app);
    }
  }

  _computeBackUrl(tail: string, baseUrl: string, app: string) {
    if (tail === undefined) {
      return;
    }

    if (app === 'cluster-reporting') {
      return this.buildUrl(this._baseUrlCluster, tail);
    }
    return tail ? this.buildUrl(baseUrl, tail) : '';
  }
}