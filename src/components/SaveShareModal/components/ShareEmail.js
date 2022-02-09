import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Map } from "immutable";

import { track, trackingProps } from "helpers/analyticsService";

import Actions from "components/common/Actions";

const ShareEmail = ({
  styles,
  shareEmail,
  onBackButtonClick,
  onCloseButtonClick,
  currentCollection,
}) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [text, setText] = useState(
    `Check out this custom dorm design I created! You can see what products I chose, and even create a design of your own.`
  );
  const [buttonDisabled, setButtonDisabled] = useState(true);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    const emailRegex = /\S+@\S+\.\S+/;
    if (event.target.validity.valid) {
      if (emailRegex.test(event.target.value)) {
        setButtonDisabled(false);
      } else {
        setButtonDisabled(true);
      }
    } else {
      setButtonDisabled(true);
    }
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await shareEmail(email, name, text);

    onCloseButtonClick();
    track("Send Email", {
      [trackingProps.ROOM_NAME]: currentCollection.get("type_name"),
    });
  };

  return (
    <>
      <div className={styles["actions-container"]}>
        <Actions
          styles={styles}
          onCloseButtonClick={onCloseButtonClick}
          onBackButtonClick={onBackButtonClick}
          backButtonText="back"
        />
      </div>
      <form onSubmit={handleSubmit}>
        <div className={styles["scroll-container"]}>
          <div
            className={`${styles.header} brandon-medium ${styles["mobile-padding-top"]}`}
          >
            Share With Email
          </div>
          <div className={styles["input-container"]}>
            <label htmlFor="email" className={styles.text}>
              Send To:
              <input
                value={email}
                onChange={handleEmailChange}
                className={styles["receipient-email"]}
                type="email"
                placeholder="Recipient email"
                required
              />
            </label>
          </div>
          <div className={styles["input-container"]}>
            <label htmlFor="name" className={styles.text}>
              From: <span>(optional)</span>
              <input
                value={name}
                onChange={handleNameChange}
                className={styles["your-name"]}
                type="text"
                placeholder="Your name"
              />
            </label>
          </div>
          <div className={styles["input-container"]}>
            <div className={styles["message-heading"]}>
              <label htmlFor="message" className={styles.text}>
                Message:{" "}
              </label>
              <div className={styles["msg-heading"]}>
                (image and link to your dorm design will be included)
              </div>
            </div>
            <textarea
              className={styles["text-area"]}
              rows="2"
              value={text}
              onChange={handleTextChange}
            />
          </div>
        </div>
        <div className={styles["send-btn-container"]}>
          <input type="submit" value="Send" disabled={buttonDisabled} />
        </div>
      </form>
    </>
  );
};

ShareEmail.propTypes = {
  styles: PropTypes.objectOf(PropTypes.string).isRequired,
  onBackButtonClick: PropTypes.func.isRequired,
  onCloseButtonClick: PropTypes.func.isRequired,
  shareEmail: PropTypes.func.isRequired,
  currentCollection: PropTypes.instanceOf(Map),
};

ShareEmail.defaultProps = {
  currentCollection: null,
};

const mapStateToProps = (state) => ({
  currentCollection: state.collection.get("currentCollection"),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ShareEmail);
