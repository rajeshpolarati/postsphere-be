// const errorCodes = require('../error-codes.json');
const errorCodes = {
    400: 'Bad Request',
    500: 'Internal Server Error',
    401: 'User Not Authorized',
    404: 'Not found',
};
  
const sendErrorResponse = (error, res) => {
    const errorObj = errorCodes[error?.message]
    ? errorCodes[error?.message]
    : { statusCode: error?.statusCode || 500, error: error?.message };
    res.status(errorObj.statusCode)
        .send({
            success: false,
            error: errorObj.error || error,
            errorCode: error?.message || error?.name || error
    })
}

const customResponse = (statusCode, data, res) =>{
    if ([200, 201, 301, 206].indexOf(statusCode) > -1) {
      res.statusCode = statusCode;
      res.send({
        success: true,
        data: data,
      });
    } else {  
      res.statusCode = statusCode;
      res.send({
        success: false,
        errorCode: errorCodes[statusCode] || 'Error',
        message: data?.message || data,
      });
    }
}

module.exports = {sendErrorResponse, customResponse}