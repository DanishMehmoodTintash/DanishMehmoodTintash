import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { track, trackingProps } from "helpers/analyticsService";

import config from "config";

const Actions = ({
  styles,
  onBackButtonClick,
  onCloseButtonClick,
  backButtonText,
  currentCollection,
  sidebarComponent,
  currentCategory,
}) => {
  const trackBackButtonClickedEvent = () => {
    switch (sidebarComponent) {
      case "ProductsList":
        return "All Categories";
      case "ProductDetailsPage":
        return "All Categories From Product Tile";
      case "FiltersPage":
        return "All Categories From Filter";
      // no default
    }
  };
  const backButtonClicked = () => {
    onBackButtonClick();
    if (sidebarComponent) {
      track(trackBackButtonClickedEvent(), {
        [trackingProps.ROOM_NAME]: currentCollection.get("type_name"),
        [trackingProps.NAV_CATEGORY]: currentCategory,
      });
    }
  };

  return (
    <div className={styles.actions}>
      <div
        className={`${styles["actions-left"]} ${
          !onBackButtonClick && styles.hidden
        }`}
      >
        <button
          className={styles["pointer-all-items"]}
          onClick={backButtonClicked}
        >
          <i className={`${styles.arrow} ${styles.left}`} /> {backButtonText}
        </button>
      </div>
      <button
        className={`${styles["close-list"]} ${styles["actions-right"]}`}
        onClick={onCloseButtonClick}
        aria-label="Close Panel"
      >
        <img alt="" src={`${config.s3BucketUrl}/utils/close.svg`} />
      </button>
    </div>
  );
};

Actions.propTypes = {
  styles: PropTypes.objectOf(PropTypes.string).isRequired,
  onCloseButtonClick: PropTypes.func.isRequired,
  onBackButtonClick: PropTypes.func,
  backButtonText: PropTypes.string,
  sidebarComponent: PropTypes.string,
  currentCategory: PropTypes.string.isRequired,
};

Actions.defaultProps = {
  onBackButtonClick: null,
  backButtonText: "All Categories",
  currentCollection: null,
  sidebarComponent: null,
};

Actions.propTypes = {
  currentCollection: PropTypes.instanceOf(Map),
};

const mapStateToProps = (state) => ({
  currentCollection: state.collection.get("currentCollection"),
  sidebarComponent: state.interaction.get("sidebarComponent"),
  currentCategory: state.collection.get("currentCategory"),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Actions);
