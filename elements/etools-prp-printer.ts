import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import UtilsMixin from '../mixins/utils-mixin';

/**
 * @polymer
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
    const style = document.createElement('style');

    style.innerHTML = 'body { color: #212121; font: 14px/1.5 Roboto, Noto, sans-serif; }';

    if (this.printWindow) {
      return this.printWindow.focus();
    }

    this.printWindow = window.open('', '', ['width=640', 'height=480', 'left=0', 'top=0'].join());

    // @ts-ignore
    this.printWindow!.document.head.appendChild(style);

    toPrint.forEach((node) => {
      try {
        const clonedNode = this._cloneNode(node);
        this.printWindow!.document.body.appendChild(clonedNode);
      } catch (error) {
        console.log(error);
      }
    }, this);

    setTimeout(() => {
      if (this.printWindow) {
        this.printWindow.print();
        this.printWindow.close();
        this.printWindow = null;
      }
    }, 100);
  }
}

export {EtoolsPrpPrinter as EtoolsPrpPrinterEl}
