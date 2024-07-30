
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';

/**
 * @customElement
 */
@customElement('status-badge')
class StatusBadge extends LitElement {
  render() {
    return html` <style>
        :host {
          display: inline-block;
          vertical-align: top;

          margin-right: 4px;
        }
        :host etools-icon {
          line-height: 1;
          --etools-icon-font-size: var(--status-badge-size, var(--etools-font-size-16, 16px));
        }
      </style>

      <etools-icon name="${this.icon}" style="color: ${this.color};"> </etools-icon>`;
  }

  @property({type: String})
  type!: string;

  @property({type: Boolean})
  hideIcon!: boolean;

  @property({type: String})
  icon!: string;

  @property({type: String})
  color!: string;

  updated(changedProperties): void {
    super.updated(changedProperties);

    if (changedProperties.has('type')) {
      this.icon = this._computeIcon(this.type);
      this.color = this._computeColor(this.type);
    }
  }

  _computeIcon(type: string) {
    if (!this.hideIcon) {
      switch (type) {
        case 'success':
          return 'icons:check-circle';
        case 'error':
        case 'warning':
          return 'icons:error';
      }
    }
    return 'image:lens';
  }

  _computeColor(type: string) {
    switch (type) {
      case 'default':
        return '#0099ff';
      case 'success':
        return '#009951';
      case 'error':
        return '#d0021b';
      case 'neutral':
        return '#d8d8d8';
      case 'warning':
        return '#ffcc00';
      case 'no-status':
        return '#273d48';
    }
    return '#273d48';
  }
}

export {StatusBadge as StatusBadgeEl};
