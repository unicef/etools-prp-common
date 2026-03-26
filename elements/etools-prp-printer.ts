import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import UtilsMixin from '../mixins/utils-mixin';
import {Environment} from '@unicef-polymer/etools-utils/src/singleton/environment';

/**
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
@customElement('etools-prp-printer')
export class EtoolsPrpPrinter extends UtilsMixin(LitElement) {
  render() {
    return html` <slot></slot> `;
  }

  @property({type: String})
  selector!: any;

  @property({type: Object})
  printWindow!: Window | null;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this._onClick.bind(this));
  }

  _onClick(e: any) {
    if (!(e.target! as HTMLElement).classList.contains('print-btn')) {
      return;
    }

    const toPrint = this.querySelectorAll(this.selector);

    var appTheme = document.createElement('link');
    appTheme.rel = 'stylesheet';
    appTheme.type = 'text/css';
    appTheme.href = Environment.baseUrl + 'assets/css/app-theme.css';

    var shoelaceStyles = document.createElement('link');
    shoelaceStyles.rel = 'stylesheet';
    shoelaceStyles.type = 'text/css';
    shoelaceStyles.href = 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.5.2/dist/themes/light.css';

    const style = document.createElement('style');

    style.innerHTML = 'body { color: #212121; font: 14px/1.5 Roboto, Noto, sans-serif; }';

    if (this.printWindow) {
      return this.printWindow.focus();
    }

    this.printWindow = window.open('', '', ['width=640', 'height=480', 'left=0', 'top=0'].join());

    // @ts-ignore
    this.printWindow!.document.head.appendChild(shoelaceStyles);
    this.printWindow!.document.head.appendChild(appTheme);
    this.printWindow!.document.head.appendChild(style);

    const restores: any = {};
    toPrint.forEach((node) => {
      const clonedNode = this._cloneNode(node, restores);
      this.printWindow!.document.body.appendChild(clonedNode);
    }, this);

    setTimeout(() => {
      if (this.printWindow) {
        Object.values(restores).forEach((restoreLifecycleMethods: any) => restoreLifecycleMethods());
        this.printWindow.print();
        this.printWindow.onafterprint = this.printWindow.close;
        this.printWindow = null;
      }
    }, 100);
  }
}

export {EtoolsPrpPrinter as EtoolsPrpPrinterEl};
