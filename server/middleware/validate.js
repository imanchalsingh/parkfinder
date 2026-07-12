import { ZodError } from 'zod';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Validate the body, query, and params if defined in the schema
      const parsedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Override the request properties only if they were validated
      if (parsedData.body !== undefined) req.body = parsedData.body;
      
      // For query and params, we might need to mutate the existing object
      // rather than reassigning, due to Express 5 getter restrictions
      if (parsedData.query !== undefined) {
        Object.keys(req.query).forEach(key => delete req.query[key]);
        Object.assign(req.query, parsedData.query);
      }
      if (parsedData.params !== undefined) {
        Object.keys(req.params).forEach(key => delete req.params[key]);
        Object.assign(req.params, parsedData.params);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
