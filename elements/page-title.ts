import {LitElement, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';

/**
 * @polymer
 * @customElement
 */
@customElement('page-title')
export class PageTitle extends LitElement {
  @property({type: String})
  baseTitle = 'PRP';

  @property({type: String})
  divider = '|';

  @property({type: String})
  title!: string;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
  
    if (changedProperties.has('title') || changedProperties.has('divider') || changedProperties.has('baseTitle')) {
      this._setDocumentTitle(this.title, this.divider, this.baseTitle);
    }
  }

  _setDocumentTitle(...args: any[]) {
    document.title = [].slice.call(args).join(' ');
  }
}

export{PageTitle as PageTitleEl};
