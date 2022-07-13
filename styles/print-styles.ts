import {html} from '@polymer/polymer';

export const printStyles = html`
  <style>
    :host {
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
    }
    tr {
      display: flex;
    }

    @media print {
      :host {
        max-width: 500px;
      }
    }
  </style>
`;
