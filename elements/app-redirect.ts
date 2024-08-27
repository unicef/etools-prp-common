import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {RootState} from '../../typings/redux.types';
import {store} from '../../redux/store';

@customElement('app-redirect')
export class AppRedirect extends connect(store)(LitElement) {
  @property({type: String})
  app?: string;

  @property({type: String})
  workspace?: string;

  @property({type: Array})
  workspaces?: any[];

  @property({type: Object})
  profile?;

  updated(changedProperties) {
    super.updated(changedProperties);

    if (
      changedProperties.has('app') ||
      changedProperties.has('workspaces') ||
      changedProperties.has('workspace') ||
      changedProperties.has('profile')
    ) {
      this._redirectIfNeeded(this.app, this.workspaces, this.workspace, this.profile);
    }
  }

  stateChanged(rootState: RootState) {
    if (rootState.app?.current) {
      this.app = rootState.app?.current;
    }
    if (rootState.workspaces?.current) {
      this.workspace = rootState.workspaces?.current;
    }
    if (rootState.workspaces?.all) {
      this.workspaces = rootState.workspaces.all;
    }
    if (rootState.userProfile?.profile) {
      this.profile = rootState.userProfile.profile;
    }
  }

  _redirectIfNeeded(app, workspaces, workspace, profile) {
    if (workspaces && !workspaces.length) {
      // user has no workspaces
      location.href = '/unauthorized';
    }
    if (!app || app === 'null' || !workspace || workspace === 'null' || !profile) {
      return;
    }
    // redirect to `unauthorized` only if we have a selected partner, otherwise let the option to select one
    if (profile.partner && (!profile.access || !profile.access.length || profile.access.indexOf(app) === -1)) {
      location.href = '/unauthorized';
    }
  }

  render() {
    return html``;
  }
}
