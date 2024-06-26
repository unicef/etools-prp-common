import {LitElement, PropertyValues, html} from 'lit';
import {property} from 'lit/decorators.js';
import '@polymer/paper-button/paper-button';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icon/iron-icon';
import '@polymer/polymer/lib/elements/dom-if';
import Constants from '../constants';
import {GenericObject} from '../typings/globals.types';
import {buttonsStyles} from '../styles/buttons-styles';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class ConfirmBox extends LitElement {
    render() {
    return html`
      ${buttonsStyles}
      <style include="iron-flex iron-flex-reverse iron-flex-alignment">
        :host {
          display: block;
        }

        .overlay {
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          z-index: 10;
          background: rgba(0, 0, 0, 0.3);
        }

        .prompt {
          box-sizing: border-box;
          width: calc(100% - 48px);
          padding: 24px;
          background: white;
          box-shadow: 0 1px 2px 1px rgba(0, 0, 0, 0.1);
          font-weight: 600;
        }

        .info-wrapper {
          display: flex;
          align-items: center;
        }

        .info-icon {
          color: #e2d96b;
          display: block;
          flex: 1 0 45px;
          height: 45px;
          margin-right: 20px;
        }
      </style>

      ${this.active ? html`
        <div class="overlay layout horizontal center-center" style="position: ${this.position};">
          <div class="prompt" style="max-width: ${this.config.maxWidth};">
            <div class="info-wrapper">
              <iron-icon class="info-icon" icon="info-outline"></iron-icon>
              <p>${this.config.body}</p>
            </div>
            <div class="layout horizontal-reverse">
              <paper-button class="btn-primary" on-tap="_ok"> ${this.config.okLabel} </paper-button>

              <paper-button on-tap="_cancel"> ${this.config.cancelLabel} </paper-button>
            </div>
          </div>
        </div>`: ``}
    `;
  }

  @property({type: Boolean})
  active = false;

  @property({type: String})
  position!: string;

  @property({type: Object})
  config = {
    okLabel: 'Continue',
    cancelLabel: 'Cancel',
    maxWidth: '100%',
    mode: Constants.CONFIRM_INLINE,
    result: <GenericObject>{},
    body: ''
  };

  connectedCallback(): void {
    super.connectedCallback();
    this.position = this._computePosition(this.config);
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('config')) {
      this.position = this._computePosition(this.config);
    }
  }

  _computePosition(config: GenericObject) {
    switch (config.mode) {
      case Constants.CONFIRM_INLINE:
        return 'absolute';

      case Constants.CONFIRM_MODAL:
      default:
        return 'fixed';
    }
  }

  _ok() {
    try {
      if (this.config.result && this.config.result.promise) {
        this.config.result.resolve();
      }
    } catch (err) {
      console.log(err);
    }

    this._close();
  }

  _cancel() {
    try {
      if (this.config.result && this.config.result.promise) {
        this.config.result.reject();
      }
    } catch (err) {
      console.log(err);
    }

    this._close();
  }

  _open() {
    this.active = true;
  }

  _close() {
    this.active = false;
  }

  run(config: GenericObject) {
    this.config = Object.assign({}, this.config, config);
    this._open();
  }
}

window.customElements.define('confirm-box', ConfirmBox);

export {ConfirmBox as ConfirmBoxEl};
