import React, { useLayoutEffect, useState, useRef } from "react";
import { List, Map } from "immutable";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Loader from "react-loader-spinner";
import ClampLines from "react-clamp-lines";

import { track, trackingProps } from "helpers/analyticsService";

import {
  setSortState,
  setSearchString,
  setFilterDisclaimer,
} from "actions/interaction";
import { applyFilters, setFilteredItems,  loadCategoryImagesInHashMap } from "actions/collection";

import Actions from "components/common/Actions";

import config from "config";

import ListHeader from "./components/ListHeader";

const ProductsList = ({
  styles,
  currentCategory,
  hashMap,
  onBackButtonClick,
  onItemDetailsClick,
  closeSidebar,
  onItemClick,
  onItemRemove,
  sortState,
  setSortState,
  searchString,
  setSearchString,
  filteredItems,
  onFiltersClick,
  applyFilters,
  appliedFilters,
  selectedItemsMap,
  filterCount,
  loadCategoryImagesInHashMap,
  currentId,
  filterDisclaimers,
  currentBrand,
  setFilterDisclaimer,
  currentCollection,
  itemsData,
  setFilteredItems,
}) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [disclaimerVisible, setDisclaimerVisible] = useState(false);

  const listRef = useRef(null);

  const selectedItem = selectedItemsMap.get(currentCategory);

  useLayoutEffect(() => {
    listRef.current.scrollTo(0, 0);

    const filterMessageState = filterDisclaimers.get(currentCategory);

    switch (filterMessageState) {
      case "tooltip":
        setTooltipVisible(true);
        setDisclaimerVisible(false);
        break;
      case "disclaimer":
        setDisclaimerVisible(true);
        setTooltipVisible(false);
        break;
      default:
        setDisclaimerVisible(false);
        setTooltipVisible(false);
    }
  }, [filterDisclaimers, currentCategory]);
  
  useLayoutEffect(() => {
    if (filteredItems.size === 0 && tooltipVisible) {
      setDisclaimerVisible(true);
      setTooltipVisible(false);
    }
  }, [tooltipVisible]);
  
  useLayoutEffect(() => {
    if (filteredItems.size) {
      loadCategoryImagesInHashMap(filteredItems);
    }
  }, [filteredItems]);

  const onTooltipClose = () => {
    setTooltipVisible(false);
    setFilterDisclaimer(null, currentCategory);
  };

  const onDisclaimerClose = () => {
    setDisclaimerVisible(false);
    setFilterDisclaimer(null, currentCategory);
  };

  const isImageLoaded = (render) => {
    return hashMap.get(currentId)?.has(render);
  };

  const removeItem = () => {
    track("Clear Product Tile", {
      [trackingProps.ROOM_NAME]: currentCollection.get("type_name"),
      [trackingProps.NAV_CATEGORY]: currentCategory,
    });
    onItemRemove(currentCategory);
  };

  const isSelectedItem = (item) => {
    if (selectedItem) {
      return item.get("sku_id") === selectedItem.get("sku_id");
    }
  };

  useLayoutEffect(() => {
    console.log('I am Apply Filters');
    applyFilters();
  }, [sortState, searchString, currentCategory, appliedFilters]);

  useLayoutEffect(() => {
    if (filteredItems.size === 0 && searchString.length === 0 && disclaimerVisible) {
      const list = itemsData.get(currentCategory)?.toJS();
      setFilteredItems(list);
    }
  }, [searchString, disclaimerVisible, sortState, filteredItems]);


  return (
    <div className={styles["product-list"]} id="bottom_menu_details">
      <Actions
        styles={styles}
        onBackButtonClick={onBackButtonClick}
        onCloseButtonClick={closeSidebar}
      />
      <div className={styles["btm-actions-container"]}>
        <h1 className={`${styles.marker} proxima`}>{currentCategory}</h1>
        <ListHeader
          styles={styles}
          sortState={sortState}
          setSortState={setSortState}
          currentCategory={currentCategory}
          searchString={searchString}
          setSearchString={setSearchString}
          onFiltersClick={onFiltersClick}
          filterCount={filterCount}
          appliedFilters={appliedFilters}
          tooltipVisible={tooltipVisible}
          onTooltipClose={onTooltipClose}
          currentBrand={currentBrand}
          currentCollection={currentCollection}
        />
        <div className={styles["item-list-container"]} ref={listRef}>
          <ul className={styles["item-list"]} role="listbox">
            {disclaimerVisible && (
              <li className={styles.disclaimer}>
                <p>Disclaimer</p>
                <p>
                  {currentBrand} doesn’t have any{" "}
                  {currentCategory?.toLowerCase()}, but check out these other
                  great selections:
                </p>
                <button onClick={onDisclaimerClose} aria-label="Close Tooltip">
                  <img
                    src={`${config.s3BucketUrl}/utils/close-small.svg`}
                    alt=""
                  />
                </button>
              </li>
            )}
            {filteredItems.map((item) => (
              <li
                id={`current_web_${item.get("sku_id")}`}
                key={`current_web_${item.get("sku_id")}`}
                className={`${styles["product-container"]}
                ${isSelectedItem(item) && styles["selected-item-border"]} ${
                  !isImageLoaded(item.get("render")) && styles["item-loading"]
                }`}
              >
                <button
                  onClick={() => onItemClick(item)}
                  disabled={!isImageLoaded(item.get("render"))}
                  className={`${styles["item-content"]}`}
                >
                  <Loader
                    className={styles["item-loader"]}
                    type="TailSpin"
                    color="#313131"
                    visible={!isImageLoaded(item.get("render"))}
                    height={40}
                    width={40}
                  />
                  <span
                    className={styles["product-image"]}
                    id={item.get("item_id")}
                  >
                    <img
                      alt={item.get("name")}
                      src={`${config.baseUrl}/${item
                        .get("thumbnail")
                        .replace("full_size", "thumbnail/90x90")}`}
                    />
                  </span>
                  <span className={styles["product-detail-container"]}>
                    <span id={`product-description-${item.get("sku_id")}`}>
                      <span className={`${styles["brand-name"]} proxima`}>
                        {item.get("brand")}
                      </span>
                      <ClampLines
                        className={styles["product-description"]}
                        text={item.get("name")}
                        buttons={false}
                        lines={2}
                        ellipsis="..."
                        innerElement="p"
                      />
                      <span className={`${styles["product-price"]} proxima`}>
                        $
                        {item.get("is_sale") === "true"
                          ? item.get("price_sale")
                          : item.get("price")}
                        {item.get("is_sale") === true && (
                          <span>{item.get("price")}</span>
                        )}
                      </span>
                    </span>
                  </span>
                </button>
                <button
                  className={`${styles["product-view-detail"]} proxima-semibold`}
                  onClick={() => onItemDetailsClick(item)}
                  aria-label={`View details for ${item.get("name")}`}
                >
                  SEE DETAILS
                  <img
                    src={`${config.s3BucketUrl}/utils/arrow-right.svg`}
                    alt=""
                    className={styles["right-arrow-img"]}
                  />
                </button>
              </li>
            ))}
            {filteredItems.size > 0 && (
              <li
                className={`${styles["remove-item"]} ${
                  styles["product-detail-container"]
                } ${styles["product-container"]} ${
                  !selectedItem && styles["selected-item-border"]
                }`}
              >
                <button onClick={removeItem}>
                  <img
                    alt=""
                    src={`${config.s3BucketUrl}/utils/remove-item.svg`}
                  />
                  <p>No {currentCategory}</p>
                </button>
              </li>
            )}
          </ul>
        </div>
        {filteredItems.size <= 0 && (
          <div className={styles["no-data-search"]}>
            <img alt="" src={`${config.s3BucketUrl}/utils/no-data-found.svg`} />
            <div className={styles.heading}>No Results Found</div>
            <div className={styles["sub-title"]}>
              We’re sorry, we don’t have any matches for that. Try&nbsp;
              <button
                className={styles["clear-search"]}
                onClick={() => setSearchString("")}
              >
                clearing your search
              </button>
              , or searching something different.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ProductsList.propTypes = {
  styles: PropTypes.objectOf(PropTypes.string).isRequired,
  currentCategory: PropTypes.string.isRequired,
  hashMap: PropTypes.instanceOf(Map).isRequired,
  onBackButtonClick: PropTypes.func.isRequired,
  onItemDetailsClick: PropTypes.func.isRequired,
  closeSidebar: PropTypes.func.isRequired,
  onItemClick: PropTypes.func.isRequired,
  onItemRemove: PropTypes.func.isRequired,
  setSortState: PropTypes.func.isRequired,
  sortState: PropTypes.oneOf(["newest", "lowToHigh", "highToLow"]).isRequired,
  setSearchString: PropTypes.func.isRequired,
  searchString: PropTypes.string.isRequired,
  applyFilters: PropTypes.func.isRequired,
  setFilteredItems: PropTypes.func.isRequired,
  filteredItems: PropTypes.instanceOf(List).isRequired,
  onFiltersClick: PropTypes.func.isRequired,
  appliedFilters: PropTypes.instanceOf(Map).isRequired,
  selectedItemsMap: PropTypes.instanceOf(Map).isRequired,
  filterCount: PropTypes.number.isRequired,
  loadCategoryImagesInHashMap: PropTypes.func.isRequired,
  currentId: PropTypes.number.isRequired,
  filterDisclaimers: PropTypes.instanceOf(Map).isRequired,
  setFilterDisclaimer: PropTypes.func.isRequired,
  currentBrand: PropTypes.string,
  currentCollection: PropTypes.instanceOf(Map),
};

ProductsList.defaultProps = {
  currentBrand: "",
};

const mapStateToProps = (state) => {
  return {
    itemsData: state.collection.get("itemsData"),
    currentCategory: state.collection.get("currentCategory"),
    filteredItems: state.collection.get("filteredItems"),
    selectedItemsMap: state.collection.get("selectedItemsMap"),
    currentId: state.collection.get("currentId"),
    hashMap: state.experience.get("imagesHashMap"),
    sortState: state.interaction.get("sortState"),
    searchString: state.interaction.get("searchString"),
    appliedFilters: state.interaction.get("appliedFilters"),
    filterCount: state.interaction.get("filterCount"),
    currentBrand: state.experience.get("currentBrand"),
    filterDisclaimers: state.interaction.get("filterDisclaimers"),
    currentCollection: state.collection.get("currentCollection"),
  };
};

const mapDispatchToProps = {
  setSortState,
  setSearchString,
  applyFilters,
  setFilteredItems,
  loadCategoryImagesInHashMap,
  setFilterDisclaimer,
};

ProductsList.defaultProps = {
  currentCollection: null,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductsList);
