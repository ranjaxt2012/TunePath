// TODO: API request/response shapes — align with FastAPI Pydantic schemas
export type ApiErrorShape = {
  error: {
    code: string;
    message: string;
  };
};
