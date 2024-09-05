import {html} from 'lit';

export const progressBarStyles = html`
  <style>
    :host {
      width: 100%;
      min-width: 100px;
      max-width: 300px;
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
    }

    sl-progress-bar {
      --indicator-color: var(--etools-indicator-color, var(--sl-color-primary-600));
      --height: var(--etools-prp-progress-bar-height, 15px);
      margin-right: 5px;
      flex: 1;
    }

    span.percentage {
      display: block;
      line-height: var(--etools-prp-progress-bar-height, 15px);
    }

    #primaryProgress,
    #secondaryProgress {
      height: 15px;
    }
  </style>
`;
