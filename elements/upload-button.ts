import {LitElement, PropertyValues, html} from 'lit';
import {property} from 'lit/decorators.js';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button';
import '@unicef-polymer/etools-file/etools-file';
import UtilsMixin from '../mixins/utils-mixin';
import ModalMixin from '../mixins/modal-mixin';
import LocalizeMixin from '../mixins/localize-mixin';
import './etools-prp-ajax';
import {EtoolsPrpAjaxEl} from './etools-prp-ajax';
import './error-box';
import {buttonsStyles} from '../styles/buttons-styles';
import {modalStyles} from '../styles/modal-styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {PaperDialogElement} from '@polymer/paper-dialog/paper-dialog';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 */
class UploadButton extends ModalMixin(LocalizeMixin(UtilsMixin(LitElement))) {
  render() {
    return html`
      ${buttonsStyles} ${modalStyles}
      <style include="iron-flex iron-flex-alignment iron-flex-reverse">
        :host {
          --etools-file-main-btn-color: var(--theme-primary-color);

          --paper-dialog: {
            width: 400px;
            margin: 0;
          }
        }

        .row {
          margin: 16px 0;
        }
      </style>

      <etools-prp-ajax id="upload" method="post" .url="${this.url}" body="${this.payload}"> </etools-prp-ajax>

      <paper-button class="btn-primary" on-tap="_openModal">
        <iron-icon icon="icons:file-upload"></iron-icon>
        <slot></slot>
      </paper-button>

      <paper-dialog id="dialog" modal ?opened="${this.opened}">
        <div class="header layout horizontal justified">
          <h2>
            <slot>${this.modalTitle}</slot>
          </h2>

          <paper-icon-button class="self-center" on-tap="close" icon="icons:close"> </paper-icon-button>
        </div>

        <paper-dialog-scrollable>
        ${this.opened ? 
          html`<error-box errors="${this.errors}"></error-box>
            <div class="row">
              <etools-file files="${this.files}" label="Template file" ?disabled="${this.pending}" accept=".xlsx, .xls" required>
              </etools-file>
            </div>`: ``}
        </paper-dialog-scrollable>

        <div class="buttons layout horizontal-reverse">
          <paper-button on-tap="_save" class="btn-primary" raised> Save </paper-button>

          <paper-button on-tap="close"> Cancel </paper-button>
        </div>

        <etools-loading ?active="${this.pending}"></etools-loading>
      </paper-dialog>
    `;
  }

  @property({type: String})
  url!: string;

  @property({type: Array})
  files!: any[];

  @property({type: Boolean})
  pending!: boolean;

  @property({type: String})
  modalTitle!: string;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
  
    if (changedProperties.has('opened')) {
      this._setDefaults(this.opened);
    }
  }
  
  _openModal() {
    (this.shadowRoot!.querySelector('#dialog') as PaperDialogElement).open();
  }

  _save() {
    const file = this.get('files.0');

    if (!file) {
      return;
    }

    const data = new FormData();
    data.append('file', file.raw, file.file_name);

    const upload = this.shadowRoot!.querySelector('#upload') as EtoolsPrpAjaxEl;
    upload!.body = data;

    this.pending = true;

    upload!
      .thunk()()
      .then(() => {
        this.pending = false;
        this.close();
        fireEvent(this, 'toast', {
          text: this.localize('file_uploaded'),
          showCloseBtn: true
        });
        fireEvent(this, 'file-uploaded');
      })
      .catch((res: any) => {
        this.pending = false;
        this.errors = res.data;
      });
  }

  _setDefaults(opened: boolean) {
    if (!opened) {
      return;
    }

    this.files = [];
    this.errors = {};
    this.pending =  false;
  }
}

window.customElements.define('upload-button', UploadButton);
