import {LitElement, PropertyValues, html} from 'lit';
import {property} from 'lit/decorators.js';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import RoutingMixin from '../mixins/routing-mixin';
import {setWorkspace} from '../../redux/actions';
import {GenericObject} from '../typings/globals.types';
import Endpoints from '../endpoints';
import {EtoolsPrpAjaxEl} from './etools-prp-ajax';
import { store } from '../../redux/store';
import { RootState } from '../../typings/redux.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin RoutingMixin
 */
class WorkspaceDropdown extends connect(store)(RoutingMixin(LitElement)) {
   render() {
    return html` <style>
        :host {
          display: block;
          position: relative;
          cursor: pointer;
          @apply --select-plan-workspaces-offset;
        }

        paper-dropdown-menu {
          width: 160px;
          @apply --workspaces-dropdown-width;

          --paper-input-container-underline: {
            display: none;
            @apply --underline-shown;
          }

          --paper-input-container-underline-focus: {
            display: none;
          }

          --paper-input-container-underline-disabled: {
            display: none;
          }

          --paper-input-container-input: {
            color: var(--theme-primary-text-color-medium);
          }

          --paper-dropdown-menu-icon: {
            color: var(--theme-primary-text-color-medium);
          }

          --paper-input-container-label: {
            top: 4px;
            color: var(--theme-primary-text-color-medium);
          }

          --paper-input-container-input: {
            margin-bottom: 2px;
            color: var(--theme-primary-text-color-medium);
            @apply --workspace-dropdown-input;
          }
        }

        paper-item {
          font-size: 15px;
          white-space: nowrap;
          cursor: pointer;
          padding: 0px 16px;
          min-height: 48px;
        }
      </style>

      <etools-prp-ajax
        id="changeworkspace"
        method="post"
        .url="${this.changeworkspaceUrl}"
        .body="${this.workspaceData}"
        content-type="application/json"
      >
      </etools-prp-ajax>

      <paper-dropdown-menu label="${this.workspace.name}" noink no-label-float>
        <paper-listbox
          slot="dropdown-content"
          class="dropdown-content"
          on-iron-select="${this._workspaceSelected}"
          selected="${this.selected}"
        >
          ${(this.data || []).map((item: any) => html`<paper-item>${item.name}</paper-item>`)}
        </paper-listbox>
      </paper-dropdown-menu>`;
  }

  @property({type: Object})
  workspace!: GenericObject;

  @property({type: Number})
  selected = 0;

  @property({type: String})
  current!: string;

  @property({type: Array})
  data!: any[];

  @property({type: String})
  changeworkspaceUrl = Endpoints.changeWorkspace();

  @property({type: Object})
  workspaceData!: GenericObject;

  private prevWorkspace!: string;

  stateChanged(state: RootState) {
   if(state?.workspaces?.current && this.current !== state.workspaces.current) {
    this.current = state.workspaces.current;
    this._currentWorkspaceChanged();
   }
   if(state?.workspaces?.all && this.data !== state.workspaces.all) {
    this.data = state.workspaces.all;
   }
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
  
    if (changedProperties.has('data') || changedProperties.has('current')) {
      this.workspace = this._computeWorkspace(this.data, this.current);
      this.selected = this._computeSelected(this.data, this.current);
    }
  }

  _currentWorkspaceChanged() {
    if (this.current) {
      if (!this.prevWorkspace) {
        this.prevWorkspace = this.current;
      } else if (this.prevWorkspace != this.current) {
        window.location.href = this.buildUrl(this._baseUrl, '/');
      }
    }
  }

  _workspaceSelected(e: CustomEvent) {
    //@dci  (this.$.repeat as DomRepeat).itemForElement(e.detail.item);
    const workspace = e.detail.item;
    const newCode = workspace.code;
    if (!newCode || newCode === this.current) {
      return;
    }

    this.workspaceData = {workspace: workspace.id};
    const thunk = (this.$.changeworkspace as EtoolsPrpAjaxEl).thunk();
    thunk()
      .then(() => {
        this.reduxStore.dispatch(setWorkspace(newCode));
      })
      .catch((err) => {
        console.log(err);
      });
  }

  _computeWorkspace(data: any[], code: string) {
    if (data) {
      return data.filter(function (workspace) {
        return workspace.code === code;
      })[0];
    }
  }

  _computeSelected(data: any[], workspace: string) {
    if (!data) {
      return -1;
    }
    return data.findIndex((x) => x.code === workspace);
  }
}

window.customElements.define('workspace-dropdown', WorkspaceDropdown);
