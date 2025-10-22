/* #swagger.tags = ['Middlewares'] */
/* #swagger.responses[400] = { description: 'Validation failed (bad body/query/params)' } */
export function validate(options) {
    return (req, res, next) => {
        const errors = [];
        if (options.body) {
            const { error } = options.body.validate(req.body);
            if (error) {
                errors.push(...error.details.map(detail => detail.message));
            }
        }
        if (options.query) {
            const { error } = options.query.validate(req.query);
            if (error) {
                errors.push(...error.details.map(detail => detail.message));
            }
        }
        if (options.params) {
            const { error } = options.params.validate(req.params);
            if (error) {
                errors.push(...error.details.map(detail => detail.message));
            }
        }
        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }
        next();
    };
}
