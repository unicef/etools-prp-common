import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-upload/etools-file';
import {get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import './error-box';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {upload} from '@unicef-polymer/etools-utils/dist/etools-ajax/upload-helper';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';

/**
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
@customElement('upload-button')
export class UploadButton extends LitElement {
  @property({type: String, attribute: 'url'})
  url!: string;

  @property({type: Array})
  files: any[] = [];

  @property({type: Boolean})
  pending!: boolean;

  @property({type: Object})
  errors!: any;

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
        etools-dialog::part(title) {
          text-align: left;
        }
      </style>

      <etools-button variant="text" @click="${this._openModal}">
        <etools-icon slot="prefix" name="file-upload"></etools-icon>
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
                  @files-changed="${({detail}: CustomEvent) => (this.files = detail)}"
                  label="Template file"
                  ?disabled="${this.pending}"
                  accept=".xlsx, .xls"
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

    const config = {uploadEndpoint: this.url};
    upload(config, file.raw, file.file_name)
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
        this.errors = res.response;
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
