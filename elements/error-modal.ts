import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {get as getTranslation, translate} from 'lit-translate';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';

/**
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
@customElement('error-modal')
export class ErrorModal extends LitElement {
  render() {
    return html`
      <style>
        etools-dialog {
          --divider-color: transparent;
        }
        etools-dialog::part(header) {
          display: none;
        }
      </style>
      <etools-dialog hide-confirm-btn .cancelBtnText="${translate('CLOSE')}">
        <div>
          <ul>
            ${(this.localizedErrors || []).map((localizedError: any) => html`<li>${localizedError}</li>`)}
          </ul>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Array})
  errors!: string[];

  @property({type: Array})
  localizedErrors!: any[];

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('errors')) {
      this.localizedErrors = this._localizeErrors(this.errors);
    }
  }

  set dialogData(data: any) {
    const {errors}: any = data;

    this.errors = errors;
  }

  _localizeErrors(errors: string[]) {
    if (!errors || errors.length === 0) {
      return [];
    }

    const localizedErrors = errors.map(function (error) {
      switch (error) {
        case 'You have not selected overall status for one of Outputs':
          return getTranslation('NOT_SELECTED_OVERALL_STATUS');
        case 'You have not completed Partner Contribution To Date field on Other Info tab.':
          return getTranslation('NOT_COMPLETED_PARTNER_CONTRIBUTION');
        case 'You have not completed Challenges / bottlenecks in the reporting period field on Other Info tab.':
          return getTranslation('NOT_COMPLETED_CHALLENGES_BOTTLENECKS');
        case 'You have not completed Proposed way forward field on Other Info tab.':
          return getTranslation('NOT_COMPLETED_PROPOSED_WAY');
        case 'You have not completed all indicator location data across all indicator reports for this progress' +
          ' report.':
          return getTranslation('NOT_COMPLETED_INDICATOR_LOCATION');
        default:
          return error;
      }
    });

    return localizedErrors;
  }
}

export {ErrorModal as ErrorModalEl};
