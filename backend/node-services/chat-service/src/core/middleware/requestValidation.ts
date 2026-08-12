import { Request, Response, NextFunction } from "express";
import { AnyObjectSchema, ValidationError } from "yup";
import { logger } from "../services/logger.service";

export const validateRequest = (schema: AnyObjectSchema) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // abortEarly: false ensures Yup collects ALL errors, not just the first one
      await schema.validate(
        {
          body: req.body,
          query: req.query,
          params: req.params,
        },
        { abortEarly: false },
      );

      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        // Formats errors into a clean key-value pair object (e.g., { "body.name": "Conversation name is required" })
        const formattedErrors = error.inner.reduce(
          (acc, curr) => {
            if (curr.path)
              acc[(curr.path.split(".")[1] as string) ?? "field"] =
                curr.message;
            return acc;
          },
          {} as Record<string, string>,
        );

        logger.error(
          `Error in Validation Middleware ---> ${JSON.stringify(formattedErrors, null, 2)}`,
        );

        throw new Error("Error in validating request.", {
          cause: formattedErrors,
        });
      }

      logger.error(
        `Error in Validation Middleware ---> ${JSON.stringify(error)}`,
      );

      throw new Error(
        "Something went wrong. Failed to validate request payload.",
      );
    }
  };
};
