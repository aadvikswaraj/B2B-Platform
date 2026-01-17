export function resolveCommission(category) {
  if (!category) return null;
  
  let currentCategory = category;
  // Traverse up until we find a non-inherit commission or run out of parents
  while (currentCategory && currentCategory.commission?.mode === 'inherit') {
    currentCategory = currentCategory.parentCategory;
  }
  
  // Return the commission object if found, null otherwise
  if (currentCategory?.commission && currentCategory.commission.mode !== 'inherit') {
    return currentCategory.commission;
  }
  
  return null;
}


export function resolveAcceptOrders(category) {
  if (!category) return true;
  
  // For root categories (depth 0), return their own acceptOrders value
  if (category.depth === 0) {
    return category.acceptOrders !== false; // Default to true if undefined
  }
  
  // For depth 1, check parent's acceptOrders first
  if (category.depth === 1 && category.parentCategory) {
    const parentAllows = category.parentCategory.acceptOrders !== false;
    return parentAllows ? (category.acceptOrders !== false) : false;
  }
  
  // For depth 2, check both ancestors
  if (category.depth === 2 && category.parentCategory) {
    const parent = category.parentCategory;
    const grandparent = parent?.parentCategory;
    
    // If grandparent doesn't allow, entire chain is blocked
    if (grandparent?.acceptOrders === false) return false;
    // If parent doesn't allow, this category is blocked
    if (parent?.acceptOrders === false) return false;
    // Otherwise return this category's own setting
    return category.acceptOrders !== false;
  }
  
  return true; // Default fallback
}

export function resolveSpecifications(category) {
  if (category.depth === 0) {
    return category.specifications;
  } else if (category.depth === 1 && category.parentCategory) {
    return [...category.parentCategory?.specifications, ...category.specifications];
  }
  else if (category.depth === 2 && category.parentCategory && category.parentCategory.parentCategory) {
    return [
      ...category.parentCategory.parentCategory?.specifications,
      ...category.parentCategory?.specifications,
      ...category.specifications
    ];
  }
  return [];
};

export function buildCategoryPath(category) {
  const path = [];
  let currentCategory = category;

  // Traverse up the category hierarchy to build the path
  while (currentCategory) {
    path.unshift(currentCategory); // Add the category name to the beginning of the path
    currentCategory = currentCategory.parentCategory;
  }

  return path;
};