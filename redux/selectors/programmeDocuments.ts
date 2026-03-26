import {RootState} from '@etools-apps/prp/typings/redux.types';
import {createSelector} from 'reselect';

function getAllPD(state: RootState) {
  return state.programmeDocuments.all;
}

function getCurrentPD(state: RootState) {
  return state.programmeDocuments.currentPd;
}

export const loadedProgrammeDocuments = createSelector(getAllPD, (docs: any[]) => !!docs.length);

export const currentProgrammeDocument = createSelector(getCurrentPD, (pd) => pd);

export const programmeDocuments_CurrentAuthorizedPartners = createSelector(getCurrentPD, function (currentPd: any) {
  return (currentPd.partner_focal_point || [])
    .filter(function (officer: any) {
      return officer.is_authorized_officer;
    })
    .map(function (focalPoint: any) {
      return {
        value: focalPoint.email,
        title: focalPoint.name + ' ' + focalPoint.title
      };
    });
});
