import {html} from 'lit';
import {sharedStyles} from './shared-styles';

export const tableStyles = html`
  ${sharedStyles}
  <style>
    .truncate {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      width: 100%;
    }
  </style>
`;
