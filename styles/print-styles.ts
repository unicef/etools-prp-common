import {html} from '@polymer/polymer';

export const printStyles = html`
  <style>
    :host {
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
    }

    @media print {
      :host {
        max-width: 500px;
      }
      tr {
        display: flex;
      }
      th,
      td {
        flex: 1;
      }
    }
  </style>
`;
