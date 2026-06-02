module.exports = {
    response: (status, message, data) => {
        return {
            status: status,
            message: message,
            data: data
        }
    }
}
