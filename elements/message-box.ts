import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';

/**
 * @customElement
 */
@customElement('message-box')
export class MessageBox extends LitElement {
  render() {
    return html` <style>
        ${layoutStyles} :host {
          display: block;
        }

        .message-box {
          padding: 5px 15px;
          font-size: 12px;
          line-height: 1.3;
          color: rgba(0, 0, 0, 0.5);
        }

        .message-box--success {
          background-color: #009951;
        }

        .message-box--error {
          background-color: #d0021b;
        }

        .message-box--warning {
          background-color: #ffcc00;
        }

        .icon-wrapper {
          margin-right: 15px;
        }

        etools-icon {
          --etools-icon-font-size: var(--etools-font-size-20, 20px);
        }
      </style>
      <div class="message-box message-box--${this.type} layout-horizontal align-items-center">
        <div class="icon-wrapper self-center">
          <etools-icon name="info"></etools-icon>
        </div>
        <div class="self-center">
          <slot></slot>
        </div>
      </div>`;
  }

  @property({type: String})
  type!: string;
}

export {MessageBox as MessageBoxEl};
