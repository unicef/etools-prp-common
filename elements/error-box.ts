import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import UtilsMixin from '../mixins/utils-mixin';
import './error-box-errors';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
/**
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
@customElement('error-box')
export class ErrorBox extends UtilsMixin(LitElement) {
  render() {
    return html`
      <style>
        ${layoutStyles} #box {
          background: var(--paper-grey-300);
          padding: 10px;
          color: var(--error-color);
        }

        .header {
          margin-bottom: 1em;
        }

        etools-icon {
          margin-right: 5px;
        }
      </style>

      <div id="box" ?hidden="${this._hidden}">
        <div class="header layout-horizontal align-items-center">
          <etools-icon name="icons:error"></etools-icon>
          <span>Error(s) occurred. Please check the list to save the form.</span>
        </div>

        <error-box-errors .errors="${this.mappedErrors}"> </error-box-errors>
      </div>
    `;
  }

  @property({type: Object}) // @@ observer: '_scrollToBox'
  errors: any = {};

  @property({type: Array})
  mappedErrors: any[] = [];

  @property({type: Boolean})
  _hidden = true;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('errors')) {
      this.mappedErrors = this._computeMappedErrors(this.errors);
    }
    if (changedProperties.has('mappedErrors')) {
      this._hidden = this._computeHidden(this.mappedErrors);
    }
  }

  _computeMappedErrors(errors: any[]) {
    return this.errorMapper(errors);
  }

  _scrollToBox() {
    setTimeout(() => {
      (this.shadowRoot!.querySelector('#box') as HTMLDivElement).scrollIntoView();
    });
  }

  _computeHidden(mappedErrors: any[]) {
    return !mappedErrors.length;
  }

  errorMapper(error: any) {
    if (!error) {
      return [];
    }
    switch (typeof error) {
      case 'string':
        return [
          {
            value: error
          }
        ];

      default:
        return Object.keys(error)
          .filter((key) => {
            return key !== 'error_codes';
          })
          .map((key) => {
            return {
              field: key,
              details: error[key].reduce((acc: any, err: any) => {
                return acc.concat(this.errorMapper(err));
              }, [])
            };
          });
    }
  }
}
