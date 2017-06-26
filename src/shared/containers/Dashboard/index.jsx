/**
 * Container component for the my-dashboard page
 *
 */
/* global location */

import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import shortid from 'shortid';
import _ from 'lodash';

import actions from 'actions/dashboard';
import cActions from 'actions/challenge-listing';
import { processActiveDevDesignChallenges } from 'utils/tc';
import Header from 'components/Dashboard/Header';
import SubtrackStats from 'components/Dashboard/SubtrackStats';
import MyChallenges from 'components/Dashboard/MyChallenges';
import SRM from 'components/Dashboard/SRM';
import Program from 'components/Dashboard/Program';
import CommunityUpdates from 'components/Dashboard/CommunityUpdates';
import LoadingIndicator from 'components/LoadingIndicator';
import './styles.scss';

// The container component
class DashboardPageContainer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loadingMyChallenges: false,
      loadingMyMarathon: false,
      loadingIosChallenges: false,
    };
  }

  componentDidMount() {
    if (!this.props.auth.tokenV2) {
      location.href = 'http://accounts.topcoder-dev.com/#!/member?retUrl=http:%2F%2Flocal.topcoder-dev.com:3000%2Fmy-dashboard';
      return false;
    }
    this.props.getBlogs();
    return true;
  }

  componentDidUpdate(prevProps) {
    const { user, tokenV3 } = this.props.auth;
    const { challenges } = this.props.challengeListing;
    const { iosRegistered } = this.props.dashboard;
    if (tokenV3 && tokenV3 !== prevProps.auth.tokenV3) {
      setImmediate(() => {
        this.props.getSubtrackRanks(tokenV3, user.handle);
        this.props.getSRMs(tokenV3, user.handle);
        this.props.getIosRegistration(tokenV3, user.userId);
        this.props.getUserFinancials(tokenV3, user.handle);
      });
    }
    if (user && !prevProps.auth.user && (!challenges || !challenges.length)) {
      setImmediate(
        () => {
          this.setState({ loadingMyChallenges: true });
          this.props.getChallenges(
            {
              status: 'ACTIVE',
            }, {
              limit: 8,
              orderBy: 'submissionEndDate',
            }, tokenV3, 'active', user.handle,
          ).then(() => {
            this.setState({ loadingMyChallenges: false });
          })
          .catch(() => {
            this.setState({ loadingMyChallenges: false });
          });

          this.setState({ loadingMyMarathon: true });
          this.props.getMarathonMatches(
            {
              status: 'ACTIVE',
            }, {
              limit: 8,
            }, tokenV3, 'myActiveMM', user.handle,
          )
          .then(() => {
            this.setState({ loadingMyMarathon: false });
          })
          .catch(() => {
            this.setState({ loadingMyMarathon: false });
          });
        },
      );
    }
    if (iosRegistered && !prevProps.dashboard.iosRegistered) {
      setImmediate(
        () => {
          this.setState({ loadingIosChallenges: true });
          this.props.getChallenges({
            platforms: 'ios',
            technologies: 'swift',
            status: 'active',
          }, {
            limit: 3,
            offset: 0,
            orderBy: 'submissionEndDate asc',
          })
          .then(() => {
            this.setState({ loadingIosChallenges: false });
          })
          .catch(() => {
            this.setState({ loadingIosChallenges: false });
          });
        },
      );
    }
  }

  render() {
    const {
      auth: { profile, user, tokenV3 },
      dashboard: {
        subtrackRanks, srms, iosRegistered, blogs, financials,
        loadingSubtrackRanks, loadingSRMs, loadingBlogs,
      },
      challengeListing: { challenges },
      registerIos,
    } = this.props;
    const myChallenges = processActiveDevDesignChallenges(
      _.filter(challenges, c => !!c.users[user.handle]),
    );
    const iosChallenges = processActiveDevDesignChallenges(
      _.filter(challenges, c => c.platforms === 'iOS'),
    );

    const { loadingMyChallenges, loadingMyMarathon, loadingIosChallenges } = this.state;
    return (
      <div styleName="dashboard-container">
        <div styleName="page-container">
          <Header title={'Dashboard'} profile={profile} financials={financials} />
          <div styleName="my-dashboard-container">
            <div styleName="subtrack-stats">
              {
                loadingSubtrackRanks &&
                <LoadingIndicator theme={{}} />
              }
              {
                !loadingSubtrackRanks &&
                <SubtrackStats subtracks={subtrackRanks} handle={user ? user.handle : ''} />
              }
            </div>
            <div styleName="challenges">
              {
                (loadingMyMarathon || loadingMyChallenges) &&
                <LoadingIndicator theme={{}} />
              }
              {
                !loadingMyChallenges && !loadingMyMarathon &&
                <MyChallenges
                  challenges={myChallenges.slice(0, 8)}
                  groups={profile ? profile.groups : []}
                />
              }
            </div>
            <div styleName="tco tco17">
              <div styleName="tc-banner-placeholder cognitive">
                <div styleName="container">
                  <div styleName="img" />
                  <div styleName="description">
                    Learn about Cognitive technologies and get hands on
                    experience as a member of the Topcoder Cognitive Community.
                  </div>
                  <a
                    href="https://cognitive.topcoder.com"
                    styleName="cta tc-btn-white tc-btn-radius"
                  >Learn More</a>
                </div>
              </div>
            </div>
            <div styleName="tco tco17">
              <div styleName="tc-banner-placeholder black bg-image">
                <div styleName="container">
                  <div styleName="title">2017 Topcoder Open</div>
                  <div styleName="subtitle">October 21-24, 2017 <br /> Buffalo, NY, USA</div>
                  <div styleName="description">
                    The Ultimate Programming and Design Tournament - The Final Stage</div>
                  <a href="http://tco17.topcoder.com/" styleName="cta tc-btn-radius tc-btn-white">
                    Learn More
                  </a>
                </div>
              </div>
            </div>
            <div styleName="srms">
              {
                loadingSRMs &&
                <LoadingIndicator theme={{}} />
              }
              {
                !loadingSRMs &&
                <SRM srms={srms} />
              }
            </div>
            <div styleName="programs">
              {
                loadingIosChallenges &&
                <LoadingIndicator theme={{}} />
              }
              {
                !loadingIosChallenges &&
                <Program
                  challenges={iosChallenges.slice(0, 3)}
                  iosRegistered={iosRegistered}
                  registerIos={() => registerIos(tokenV3, user.userId)}
                />
              }
            </div>
            <div styleName="community-updates">
              {
                loadingBlogs &&
                <LoadingIndicator theme={{}} />
              }
              {
                !loadingBlogs &&
                <CommunityUpdates blogs={blogs} />
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

DashboardPageContainer.propTypes = {
  auth: PT.shape(),
  dashboard: PT.shape(),
  challengeListing: PT.shape(),
  getSubtrackRanks: PT.func.isRequired,
  getChallenges: PT.func.isRequired,
  getSRMs: PT.func.isRequired,
  getMarathonMatches: PT.func.isRequired,
  getIosRegistration: PT.func.isRequired,
  registerIos: PT.func.isRequired,
  getBlogs: PT.func.isRequired,
  getUserFinancials: PT.func.isRequired,
};

DashboardPageContainer.defaultProps = {
  auth: {},
  dashboard: {},
  challengeListing: {},
};

/**
 * Callback for loading challenges satisfying to the specified criteria.
 * All arguments starting from second should match corresponding arguments
 * of the getChallenges action.
 * @param {Function} dispatch
 */
function getChallenges(dispatch, ...rest) {
  const uuid = shortid();
  dispatch(cActions.challengeListing.getInit(uuid));
  const action = cActions.challengeListing.getChallenges(uuid, ...rest);
  dispatch(action);
  return action.payload;
}

/**
 * Callback for loading marathon matches satisfying to the specified criteria.
 * All arguments starting from second should match corresponding arguments
 * of the getChallenges action.
 * @param {Function} dispatch
 */
function getMarathonMatches(dispatch, filters, ...rest) {
  const uuid = shortid();
  dispatch(cActions.challengeListing.getInit(uuid));
  const f = _.clone(filters);
  if (f.status === 'COMPLETED') f.status = 'PAST';
  const action = cActions.challengeListing.getMarathonMatches(uuid, f, ...rest);
  dispatch(action);
  // TODO: This is hack to make the Redux loading of challenges to work
  // with older code inside the InfiniteList, until it is properly
  // refactored.
  return action.payload;
}

const mapStateToProps = state => ({
  auth: state.auth,
  dashboard: state.dashboard,
  challengeListing: state.challengeListing,
});

const mapDispatchToProps = dispatch => ({
  getSubtrackRanks: (tokenV3, handle) => {
    dispatch(actions.dashboard.getSubtrackRanksInit());
    dispatch(actions.dashboard.getSubtrackRanksDone(tokenV3, handle));
  },
  getChallenges: (...rest) => getChallenges(dispatch, ...rest),
  getMarathonMatches: (...rest) => getMarathonMatches(dispatch, ...rest),
  getSRMs: (tokenV3, handle) => {
    dispatch(actions.dashboard.getSrmsInit());
    dispatch(actions.dashboard.getSrmsDone(tokenV3, handle, {
      filter: 'status=future',
      orderBy: 'registrationStartAt',
      limit: 3,
    }));
  },
  getIosRegistration: (tokenV3, userId) => {
    dispatch(actions.dashboard.getIosRegistration(tokenV3, userId));
  },
  registerIos: (tokenV3, userId) => {
    dispatch(actions.dashboard.registerIos(tokenV3, userId));
  },
  getBlogs: () => {
    dispatch(actions.dashboard.getBlogsInit());
    dispatch(actions.dashboard.getBlogsDone());
  },
  getUserFinancials: (tokenV3, handle) => {
    dispatch(actions.dashboard.getUserFinancials(tokenV3, handle));
  },
});

const DashboardContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DashboardPageContainer);

export default DashboardContainer;
