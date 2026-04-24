module.exports = (schema) => (req, res, next) => {

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
            success: false,
            message: "Request body is Hrequired",
            data: null
        });
    }

    const { error, value } = schema.validate(req.body, {
        abortEarly: true, //Stop validation at first error
        allowUnknown: false, // Do NOT allow extra fields in request
                    stripUnknown: true  // Remove unknown fields

    })
    if (error) return res.status(400).json({ success: false, data: null, message: error.details[0].message });

    req.body = value;
    next();
}