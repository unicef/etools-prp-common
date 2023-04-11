const BASE_URL = '/api'; // TODO: versioning?

const Endpoints = {
  _buildUrl(tail: string) {
    return BASE_URL + tail;
  },
  indicatorLocationDataEntries() {
    return this._buildUrl('/indicator/indicator-location-data-entries/');
  },
  indicatorReports(reportableId: string) {
    return this._buildUrl('/indicator/' + reportableId + '/indicator-reports/');
  },
  indicatorPullData(workspaceId: string, reportId: string, indicatorId: string) {
    return this._buildUrl(
      '/unicef/' + workspaceId + '/progress-reports/' + reportId + '/indicators/' + indicatorId + '/pull/'
    );
  },
  reportProgressReset() {
    return this._buildUrl('/indicator/report-refresh/');
  },
  changeWorkspace() {
    return this._buildUrl('/account/changeworkspace/');
  },
  changeOrganization() {
    return this._buildUrl('/account/changepartner/');
  }
};

export default Endpoints;
