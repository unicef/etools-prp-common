import {LitElement, PropertyValues, html} from 'lit';
import {property} from 'lit/decorators.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import UtilsMixin from '../mixins/utils-mixin';
import LocalizeMixin from '../mixins/localize-mixin';
import {GenericObject} from '../typings/globals.types';
import {buttonsStyles} from '../styles/buttons-styles';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class ErrorModal extends LocalizeMixin(UtilsMixin(LitElement)) {
  render() {
    return html`
      ${buttonsStyles}
      <style include="iron-flex iron-flex-reverse iron-flex-alignment">
        :host {
          --paper-dialog: {
            width: 500px;
            padding: 24px;
            margin: 0;
          }
        }
      </style>

      <paper-dialog modal .opened="${this.opened}">
        <div>
          <ul>
           ${this.localizeedErrors.map((localizedError: any) => html`<li>${localizedError}</li>`)}
          </ul>
          <div class="layout horizontal-reverse">
            <paper-button class="btn-primary" dialog-dismiss> Close </paper-button>
          </div>
        </div>
      </paper-dialog>
    `;
  }

  @property({type: Array})
  errors!: string[];

  @property({type: Array})
  localizedErrors!: any[];

  @property({type: Boolean})
  opened = false;

  @property({type: Object})
  _result!: GenericObject;

  
updated(changedProperties: PropertyValues): void {
	super.updated(changedProperties);

	if (changedProperties.has('errors') || changedProperties.has('localize')) {
	  this.localizedErrors = this._localizeErrors(this.errors, this.localize);
	}
}

  open(errors: string[]) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    this.errors = errors;
    this.opened = true;

    this._result = 
      new Promise((resolve) => {
        self.addEventListener('opened-changed', function onOpenedChanged() {
          self.removeEventListener('opened-changed', onOpenedChanged);
          resolve(true);
        });
      });

    return this._result;
  }

  _localizeErrors(errors: string[], localize: any) {
    if (!errors || errors.length === 0) {
      return [];
    }

    const localizedErrors = errors.map(function (error) {
      switch (error) {
        case 'You have not selected overall status for one of Outputs':
          return localize('not_selected_overall_status');
        case 'You have not completed Partner Contribution To Date field on Other Info tab.':
          return localize('not_completed_partner_contribution');
        case 'You have not completed Challenges / bottlenecks in the reporting period field on Other Info tab.':
          return localize('not_completed_challenges_bottlenecks');
        case 'You have not completed Proposed way forward field on Other Info tab.':
          return localize('not_completed_proposed_way');
        case 'You have not completed all indicator location data across all indicator reports for this progress' +
          ' report.':
          return localize('not_completed_indicator_location');
        default:
          return error;
      }
    });

    return localizedErrors; 
  }

  close() {
    this.errors = [];
    this.opened = false;
  }
}

window.customElements.define('error-modal', ErrorModal);

export {ErrorModal as ErrorModalEl};
