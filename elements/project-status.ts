import { LitElement, PropertyValues, html } from 'lit';
import {property} from 'lit/decorators.js';
import './status-badge';
import UtilsMixin from '../mixins/utils-mixin';
import LocalizeMixin from '../mixins/localize-mixin';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class ProjectStatus extends LocalizeMixin(UtilsMixin(LitElement)) {
  render() {
    return html`
      <style>
        :host {
          display: inline-block;
        }

        status-badge {
          position: relative;
          top: -2px;
        }
      </style>
      <status-badge .type="${this.type}" hide-icon></status-badge> ${this._localizeLowerCased(this.label, this.localize)}
    `;
  }

  @property({type: String})
  status!: string;

  @property({type: String})
  type!: string | undefined;

  @property({type: String})
  label!: string;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
  
    if (changedProperties.has('status')) {
      this.type = this._computeType(this.status);
      this.label = this._computeLabel(this.status);
    }
  }

  _computeType(status: string) {
    switch (status) {
      case 'Ong':
        return 'default';
      case 'Pla':
        return 'warning';
      case 'Com':
        return 'success';
    }
    return;
  }

  _computeLabel(status: string) {
    switch (status) {
      case 'Ong':
        return 'Ongoing';
      case 'Pla':
        return 'Planned';
      case 'Com':
        return 'Completed';
    }
    return '';
  }
}

window.customElements.define('project-status', ProjectStatus);
