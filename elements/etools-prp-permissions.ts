import {LitElement, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import UtilsMixin from '../mixins/utils-mixin';
import Constants from '../constants';
import {store} from '../../redux/store';
import {RootState} from '../../typings/redux.types';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

export const createClusterEntitiesUsers = [Constants.PRP_ROLE.CLUSTER_IMO, Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN];

export const checkInResponsePlan = function (roles: any[]) {
  return function (params: any) {
    return (params.prpRoles || [])
      .filter(function (role: any) {
        return (
          params.responsePlan &&
          params.responsePlan.clusters &&
          params.responsePlan.clusters.some(function (cluster: any) {
            return role.cluster && cluster.id === role.cluster.id;
          })
        );
      })
      .some(function (item: any) {
        return roles.indexOf(item.role) > -1;
      });
  };
};

export const permissions = {
  editProgressReport: [
    Constants.PRP_ROLE.IP_AUTHORIZED_OFFICER,
    Constants.PRP_ROLE.IP_EDITOR,
    Constants.PRP_ROLE.IP_ADMIN
  ],

  exportSubmittedProgressReport: [Constants.PRP_ROLE.IP_AUTHORIZED_OFFICER, Constants.PRP_ROLE.IP_EDITOR],

  savePdReport: [Constants.PRP_ROLE.IP_AUTHORIZED_OFFICER, Constants.PRP_ROLE.IP_EDITOR, Constants.PRP_ROLE.IP_ADMIN],

  changeProgrammeDocumentCalculationMethod: [Constants.PRP_ROLE.IP_AUTHORIZED_OFFICER, Constants.PRP_ROLE.IP_EDITOR],

  createClusterEntities: checkInResponsePlan(createClusterEntitiesUsers),

  createClusterEntitiesForCluster: function (params: any, clusterId: any) {
    return params.prpRoles.some((item: any) => {
      return String(clusterId) === String(item.cluster.id) && createClusterEntitiesUsers.indexOf(item.role) > -1;
    });
  },

  submitIndicatorReport: function (params: any, report: any) {
    const allowedRoles = [
      Constants.PRP_ROLE.CLUSTER_IMO,
      Constants.PRP_ROLE.CLUSTER_MEMBER,
      Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN,
      Constants.PRP_ROLE.CLUSTER_COORDINATOR
    ];

    return params.prpRoles.some(function (item: any) {
      return (
        allowedRoles.indexOf(item.role) > -1 &&
        (item.role === Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN ||
          ((Constants.PARTNER_ROLES.indexOf(item.role) > -1
            ? report.partner_id === (params.partner && params.partner.id)
            : String(item.cluster ? item.cluster.id : '') === String(report.cluster_id)) &&
            (item.role === Constants.PRP_ROLE.CLUSTER_COORDINATOR ? !report.cluster_activity : true)))
      );
    });
  },

  editIndicatorReport: function (params: any, report: any) {
    const allowedRoles = [
      Constants.PRP_ROLE.CLUSTER_IMO,
      Constants.PRP_ROLE.CLUSTER_MEMBER,
      Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN
    ];

    return (params.prpRoles || [])
      .filter(function (role: any) {
        return (
          params.responsePlan &&
          params.responsePlan.clusters.some(function (cluster: any) {
            return role.cluster && cluster.id === role.cluster.id;
          })
        );
      })
      .some(function (item: any) {
        return (
          allowedRoles.indexOf(item.role) > -1 &&
          (item.role === Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN ||
            (Constants.PARTNER_ROLES.indexOf(item.role) > -1
              ? report.partner_id === (params.partner && params.partner.id)
              : String(item.cluster.id) === String(report.cluster_id)))
        );
      });
  },

  sendBackIndicatorReport: [Constants.PRP_ROLE.CLUSTER_IMO, Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN],

  createPartnerEntities: [
    Constants.PRP_ROLE.CLUSTER_MEMBER,
    Constants.PRP_ROLE.CLUSTER_IMO,
    Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN
  ],

  createPartnerEntitiesByResponsePlan: function (params: any, responsePlanClusters: any[]) {
    const allowedRoles = [Constants.PRP_ROLE.CLUSTER_IMO, Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN];

    return responsePlanClusters.some(function (cluster: any) {
      return params.prpRoles.some(function (item: any) {
        if (item.cluster === null) {
          return item.role === Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN;
        } else {
          return (
            item.role === Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN ||
            (String(item.cluster.id) === String(cluster.id) && allowedRoles.indexOf(item.role) > -1)
          );
        }
      });
    });
  },

  editPartnerEntities: function (params: any, entityClusters: any[]) {
    const allowedRoles = this.createPartnerEntities;

    return entityClusters.some(function (cluster) {
      return params.prpRoles.some(function (item: any) {
        if (item.cluster === null) {
          return item.role === Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN;
        } else {
          return (
            item.role === Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN ||
            (String(item.cluster.id) === String(cluster.id) && allowedRoles.indexOf(item.role) > -1)
          );
        }
      });
    });
  },

  viewPlannedAction: (params: any) => {
    const allowedRoles = [Constants.PRP_ROLE.CLUSTER_MEMBER, Constants.PRP_ROLE.CLUSTER_VIEWER];

    return (
      params.partner &&
      params.partner.id &&
      (params.prpRoles || []).some(function (item: any) {
        return allowedRoles.indexOf(item.role) > -1;
      })
    );
  },

  addPlannedActionProject: [Constants.PRP_ROLE.CLUSTER_MEMBER],

  editPlannedActionEntities: [Constants.PRP_ROLE.CLUSTER_MEMBER],

  createPartnerProject: [
    Constants.PRP_ROLE.CLUSTER_MEMBER,
    Constants.PRP_ROLE.CLUSTER_IMO,
    Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN
  ],

  adminResponsePlan: [Constants.PRP_ROLE.CLUSTER_IMO, Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN],

  addPartnerToProject: checkInResponsePlan([Constants.PRP_ROLE.CLUSTER_IMO, Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN]),

  createPartnerEntitiesAsImo: [Constants.PRP_ROLE.CLUSTER_IMO, Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN],

  addPartnerToActivity: [Constants.PRP_ROLE.CLUSTER_IMO, Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN],

  editIndicatorDetails: [
    Constants.PRP_ROLE.CLUSTER_IMO,
    Constants.PRP_ROLE.CLUSTER_MEMBER,
    Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN
  ],

  onlyEditOwnIndicatorDetails: [Constants.PRP_ROLE.CLUSTER_MEMBER, Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN],

  editIndicatorLocations: [Constants.PRP_ROLE.CLUSTER_IMO, Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN],

  accessIpIdManagement: [Constants.PRP_ROLE.IP_AUTHORIZED_OFFICER, Constants.PRP_ROLE.IP_ADMIN],

  accessClusterIdManagement: [
    Constants.PRP_ROLE.CLUSTER_MEMBER,
    Constants.PRP_ROLE.CLUSTER_IMO,
    Constants.PRP_ROLE.CLUSTER_SYSTEM_ADMIN
  ]
};
/**
 * @customElement
 * @appliesMixin UtilsMixin
 */
@customElement('etools-prp-permissions')
export class EtoolsPrpPermissions extends connect(store)(UtilsMixin(LitElement)) {
  @property({type: Object})
  profile!: any;

  @property({type: Array})
  prpRoles!: any[];

  @property({type: Array})
  imoClusters!: any[];

  @property({type: Object})
  partner!: any;

  @property({type: String})
  workspace!: string | undefined;

  @property({type: Object})
  responsePlan!: any;

  @property({type: Object})
  params!: any;

  @property({type: Object})
  permissions!: any;

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(state?.userProfile?.profile, this.profile)) {
      this.profile = state.userProfile.profile;
    }
    if (!isJsonStrMatch(state?.partner?.current, this.partner)) {
      this.partner = state.partner.current;
    }
    if (!isJsonStrMatch(state?.workspaces?.current, this.workspace)) {
      this.workspace = state.workspaces.current;
    }
    if (!isJsonStrMatch(state?.responsePlans?.current, this.responsePlan)) {
      this.responsePlan = state.responsePlans.current;
    }
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('profile')) {
      this.imoClusters = this._computeImoClusters(this.profile);
      this.prpRoles = this._computePrpRoles(this.profile);
    }
    if (
      changedProperties.has('prpRoles') ||
      changedProperties.has('imoClusters') ||
      changedProperties.has('partner') ||
      changedProperties.has('workspace') ||
      changedProperties.has('responsePlan')
    ) {
      this.params = this._computeParams(
        this.prpRoles,
        this.imoClusters,
        this.partner,
        this.workspace || '',
        this.responsePlan
      );
    }
    if (changedProperties.has('params')) {
      this.permissions = this._computePermissions(this.params);
      fireEvent(this, 'permissions-changed', {value: this.permissions});
    }
  }

  _computePermissions(params: any) {
    return Object.keys(permissions).reduce((acc: any, key: string) => {
      const granted = permissions[key];
      acc[key] = (() => {
        switch (true) {
          case Array.isArray(granted):
            return (params.prpRoles || []).some((role: any) => {
              return (
                granted.indexOf(role.role) > -1 &&
                (Constants.WORKSPACE_ROLES.indexOf(role.role) > -1
                  ? role.workspace && role.workspace.workspace_code === params.workspace
                  : true)
              );
            });

          case typeof granted === 'function':
            if (granted.length > 1) {
              return function (...args: any[]) {
                const arg = [].slice.call(args);
                return granted(...[params].concat(arg));
              };
            }

            return granted(params);

          case granted === Constants.PRP_ROLE.ALL:
            return true;

          default:
            return false;
        }
      })();

      return acc;
    }, {});
  }

  _computePrpRoles(profile: any) {
    return profile.prp_roles || [];
  }

  _computeImoClusters(profile: any) {
    return profile.prp_roles
      ? profile.prp_roles
          .filter(function (item: any) {
            return item.role === Constants.PRP_ROLE.CLUSTER_IMO;
          })
          .map(function (item: any) {
            return item.cluster;
          })
      : [];
  }

  _computeParams(prpRoles: any[], imoClusters: any[], partner: any, workspace: string, responsePlan: any) {
    return {
      prpRoles: prpRoles,
      imoClusters: imoClusters,
      partner: partner,
      workspace: workspace,
      responsePlan: responsePlan
    };
  }
}