// list function removed

export const getById = async (req, res) => {
  try {
    const item = await service.getById(req.params.id);
    if (!item) {
      res.locals.response = {
        success: false,
        message: "Product not found",
        status: 404,
      };
    } else {
      res.locals.response = {
        success: true,
        data: item,
        status: 200,
      };
    }
    return sendResponse(res);
  } catch (error) {
    console.error("Error in getById:", error);
    res.locals.response = {
      success: false,
      message: error.message,
      status: 500,
    };
    return sendResponse(res);
  }
};
