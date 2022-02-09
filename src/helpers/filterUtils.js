export const applyFilterToList = (list, filter, selectedFilters) => {
  if (!selectedFilters[filter]) return list;

  const selectedOptions = Object.keys(selectedFilters[filter]).filter(
    o => selectedFilters[filter][o]
  );

  if (!selectedOptions.length) return list;

  return list.filter(item => {
    if (filter === 'price') {
      return selectedOptions.some(o => {
        let [minPrice, maxPrice] = o.includes('+') ? o.split('+') : o.split('-');

        [minPrice, maxPrice] = [
          Number(minPrice),
          maxPrice ? Number(maxPrice) : Number.POSITIVE_INFINITY,
        ];

        const price = item.is_sale === 'true' ? item.price_sale : item.price;
        return price >= minPrice && price <= maxPrice;
      });
    }
    if (filter === 'colors') {
      return selectedOptions.some(o =>
        item.color?.toLowerCase().includes(o?.toLowerCase())
      );
    }

    return selectedOptions.some(o =>
      item.brand?.toLowerCase().includes(o?.toLowerCase())
    );
  });
};

export const applyPropertyFilters = (list, filters) => {
  if (!filters) return list;

  Object.keys(filters).forEach(key => {
    list = applyFilterToList(list, key, filters);
  });

  return list;
};

export const getFiltersCount = list => {
  let totalCount = 0;
  let filterSelectedValues = 0;
  Object.entries(list).forEach(([key, optionList]) => {
    if (list[key]) {
      filterSelectedValues = Object.keys(optionList).filter(value => optionList[value]);
      if (filterSelectedValues.length > 0) {
        totalCount = filterSelectedValues.length + totalCount;
      }
    }
  });
  return totalCount;
};

export const applySortAndSearch = (list, sortState, searchString) => {
  if (searchString) {
    const selectedItemsList = [];
    const splitSearchString = searchString.split(' ');
    list.forEach(item => {
      let searchResult = true;
      splitSearchString.forEach(searchWord => {
        const findWord = item.name?.toLowerCase().includes(searchWord?.toLowerCase());
        const skuId = item.sku_id.includes(searchWord);
        if (!findWord && !skuId) {
          searchResult = false;
        }
      });
      if (searchResult) return selectedItemsList.push(item);
    });
    list = selectedItemsList;
  }

  switch (sortState) {
    case 'lowToHigh':
      return list.sort((first, second) => {
        const firstItemPrice = first.is_sale === 'true' ? first.price_sale : first.price;
        const secondItemPrice =
          second.is_sale === 'true' ? second.price_sale : second.price;
        return firstItemPrice - secondItemPrice;
      });
    case 'highToLow':
      return list.sort((first, second) => {
        const firstItemPrice = first.is_sale === 'true' ? first.price_sale : first.price;
        const secondItemPrice =
          second.is_sale === 'true' ? second.price_sale : second.price;
        return secondItemPrice - firstItemPrice;
      });
    default:
      return list;
  }
};
