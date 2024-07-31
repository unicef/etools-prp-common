import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-upload/etools-file';
import UtilsMixin from '../mixins/utils-mixin';
import {get as getTranslation} from 'lit-translate';
import './error-box';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';

/**
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
@customElement('upload-button')
export class UploadButton extends UtilsMixin(LitElement) {
  @property({type: String, attribute: 'url'})
  url!: string;

  @property({type: Array})
  files: any[] = [];

  @property({type: Boolean})
  pending!: boolean;

  @property({type: Boolean})
  opened = false;

  @property({type: String, attribute: 'modal-title'})
  modalTitle!: string;

  render() {
    return html`
      <style>
        .row {
          margin: 16px 0;
        }
      </style>

      <etools-button class="btn-primary" @click="${this._openModal}">
        <etools-icon name="file-upload"></etools-icon>
        <slot></slot>
      </etools-button>

      <etools-dialog
        id="dialog"
        keep-dialog-open
        @close=${() => (this.opened = false)}
        ?opened=${this.opened}
        @confirm-btn-clicked="${this._save}"
        size="md"
        dialog-title="${this.modalTitle}"
      >
        ${this.opened
          ? html`<error-box .errors="${this.errors}"></error-box>
              <div class="row">
                <etools-file
                  ?showFilesContainer="${true}"
                  .files="${this.files}"
                  .label="Template file"
                  ?disabled="${this.pending}"
                  .accept=".xlsx, .xls"
                  required
                >
                </etools-file>
              </div>`
          : ``}

        <etools-loading ?active="${this.pending}"></etools-loading>
      </etools-dialog>
    `;
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('opened')) {
      this._setDefaults(this.opened);
    }
  }

  _openModal() {
    this.opened = true;
  }

  _save() {
    const file = this.files?.[0];

    if (!file) {
      return;
    }

    const data = new FormData();
    data.append('file', file.raw, file.file_name);

    this.pending = true;

    sendRequest({
      method: 'POST',
      endpoint: {url: this.url},
      body: data
    })
      .then(() => {
        this.pending = false;
        this.opened = false;
        fireEvent(this, 'toast', {
          text: getTranslation('FILE_UPLOADED'),
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
    this.pending = false;
  }
}

export {UploadButton as UploadButtonEl};
