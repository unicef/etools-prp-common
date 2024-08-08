import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '../styles/shared-styles';
import {store} from '../../redux/store';
import {RootState} from '../../typings/redux.types';

/**
 * @customElement
 * @mixinFunction
 * @appliesMixin RoutingMixin
 */
@customElement('page-header')
export class PageHeader extends connect(store)(LitElement) {
  static get styles() {
    return [layoutStyles];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        :host {
          --header-gutter: 25px;
          display: block;
          padding: var(--header-gutter);

          background: white;
          box-shadow: 0 1px 2px 1px rgba(0, 0, 0, 0.1);
        }
        etools-icon-button {
          color: #666;
        }
        .title {
          min-width: 0;
          position: relative;
          flex: 1;
        }
        .title h1 {
          font-size: 20px;
          overflow: hidden;
          white-space: nowrap;
          text-wrap: ellipsis;
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

      <div class="layout-horizontal">
        <div class="title flex">
          <div class="above-title">
            <slot name="above-title"></slot>
          </div>
          <div class="layout-horizontal align-items-center">
            ${this.back
              ? html`<a href="${this.backUrl}" class="back-button">
                  <etools-icon-button name="chevron-left"></etools-icon-button>
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
  baseUrl?: string;

  @property({type: String})
  app!: string;

  stateChanged(state: RootState) {
    if (state?.app?.current) {
      this.app = state.app.current;
    }

    if (state?.workspaces.baseUrl) {
      this.baseUrl = state?.workspaces.baseUrl;
    }
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('back') || changedProperties.has('_baseUrl') || changedProperties.has('app')) {
      this.backUrl = this._computeBackUrl(this.back, this.baseUrl, this.app);
    }
  }

  _computeBackUrl(tail?: string, baseUrl?: string, app?: string) {
    if (tail === undefined) {
      return;
    }

    if (baseUrl === undefined) {
      return;
    }

    if (app === 'cluster-reporting') {
      return `${baseUrl}/${tail}`;
    }

    return tail ? `${baseUrl}/${tail}` : '';
  }
}
