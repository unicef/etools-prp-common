import {html} from 'lit';

export const modalStyles = html` <style>
  .header {
    height: 48px;
    padding: 0 24px;
    margin: 0;
    color: white;
    background: var(--theme-primary-color);
  }

  .header h2 {
    margin: 0;
    line-height: 48px;
  }

  .header etools-icon-button {
    margin: 0 -13px 0 20px;
    color: white;
  }

  .buttons {
    padding: 24px;
    justify-content: flex-start;
  }

  .item.full-width {
  }

  .item {
    padding-right: 20px;
    margin-bottom: 20px !important;
  }
</style>`;
