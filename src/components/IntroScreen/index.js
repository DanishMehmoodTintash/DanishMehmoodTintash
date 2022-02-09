import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import storageService from "helpers/storageService";

import styles from "styles/ToolTip.module.scss";

const IntroScreen = () => {
  useEffect(() => {
    storageService().session.setItem("tooltipStatus", false);
  }, []);

  return (
    <>
      <div className={styles["intro-screen-container"]}>
        <div className={styles["brand-text"]}>
          <p>Welcome! </p>
          <p>
            Welcome to Dorm design tool! View your shopping list to purchase
            products in your dorm, or customize it by selecting individual
            items.{" "}
          </p>
        </div>
        <button>Get Started</button>
      </div>
    </>
  );
};

IntroScreen.propTypes = {
  currentBrand: PropTypes.string,
};

IntroScreen.defaultProps = {
  currentBrand: "",
};

const mapStateToProps = (state) => {
  return {
    currentBrand: state.experience.get("currentBrand"),
  };
};

export default connect(mapStateToProps)(IntroScreen);
