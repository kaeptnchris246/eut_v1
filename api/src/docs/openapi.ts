import { OpenAPIV3 } from "openapi-types";

export const openApiDocument: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "EUT Platform API",
    version: "1.0.0",
    description: "REST API for the EUT v1 platform",
  },
  servers: [{ url: "http://localhost:8080" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", format: "email" },
          fullName: { type: "string", nullable: true },
          role: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["id", "email", "role", "createdAt"],
      },
      Fund: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          code: { type: "string" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          currency: { type: "string" },
          targetAmount: { type: "number" },
          minCommitment: { type: "number" },
          status: { type: "string", enum: ["open", "closed"] },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["id", "code", "name", "currency", "targetAmount", "minCommitment", "status", "createdAt"],
      },
      Commitment: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          fundId: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          amount: { type: "number" },
          status: { type: "string", enum: ["reserved", "confirmed", "cancelled"] },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["id", "fundId", "userId", "amount", "status", "createdAt"],
      },
      Transaction: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          commitmentId: { type: "string", format: "uuid", nullable: true },
          userId: { type: "string", format: "uuid", nullable: true },
          fundId: { type: "string", format: "uuid", nullable: true },
          type: { type: "string", enum: ["reserve", "confirm", "refund"] },
          amount: { type: "number" },
          meta: { type: "object" },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["id", "type", "amount", "createdAt"],
      },
      Wallet: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          address: { type: "string", nullable: true },
          chain: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["id", "userId", "createdAt"],
      },
      Token: {
        type: "object",
        properties: {
          identifier: { type: "string" },
          name: { type: "string" },
          symbol: { type: "string" },
          address: { type: "string" },
          decimals: { type: "integer" },
          type: { type: "string", enum: ["utility", "security"] },
          chainId: { type: "integer" },
          rate: { type: "string" },
          allowlist: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["identifier", "name", "symbol", "address", "decimals", "type", "chainId", "rate", "allowlist"],
      },
      SwapQuote: {
        type: "object",
        properties: {
          direction: { type: "string", enum: ["utility_to_security", "security_to_utility"] },
          amountIn: { type: "string" },
          amountOut: { type: "string" },
          fee: { type: "string" },
          feeBps: { type: "integer" },
        },
        required: ["direction", "amountIn", "amountOut", "fee", "feeBps"],
      },
      SwapTransaction: {
        type: "object",
        properties: {
          contractAddress: { type: "string" },
          method: { type: "string" },
          args: {
            type: "array",
            items: { type: "string" },
          },
          value: { type: "string" },
          chainId: { type: "integer" },
        },
        required: ["contractAddress", "method", "args", "value", "chainId"],
      },
      ErrorResponse: {
        type: "object",
        properties: {
          status: { type: "string" },
          message: { type: "string" },
          details: {},
        },
        required: ["status", "message"],
      },
    },
    responses: {
      BadRequest: {
        description: "Bad request",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      Unauthorized: {
        description: "Authentication required",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      Forbidden: {
        description: "Insufficient permissions",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          200: {
            description: "Service status",
          },
        },
      },
    },
    "/tokens": {
      get: {
        summary: "List configured utility and security tokens",
        responses: {
          200: {
            description: "Token registry",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    tokens: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Token" },
                    },
                  },
                  required: ["tokens"],
                },
              },
            },
          },
        },
      },
    },
    "/auth/signup": {
      post: {
        summary: "Create a new investor user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                  fullName: { type: "string" },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "User created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                    token: { type: "string" },
                  },
                },
              },
            },
          },
          400: { description: "Validation error" },
        },
      },
    },
    "/swap": {
      post: {
        summary: "Prepare a swap transaction between EUT and an SPV security token",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fromToken: { type: "string", description: "ERC-20 contract address to debit" },
                  toToken: { type: "string", description: "ERC-20 contract address to credit" },
                  amount: { type: "string", description: "Amount expressed in token units" },
                  walletAddress: { type: "string", description: "User wallet executing the swap" },
                },
                required: ["fromToken", "toToken", "amount", "walletAddress"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Swap transaction payload",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    quote: { $ref: "#/components/schemas/SwapQuote" },
                    transaction: { $ref: "#/components/schemas/SwapTransaction" },
                  },
                  required: ["quote", "transaction"],
                },
              },
            },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Login with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Authenticated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                    token: { type: "string" },
                  },
                },
              },
            },
          },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/auth/me": {
      get: {
        security: [{ bearerAuth: [] }],
        summary: "Current authenticated user",
        responses: {
          200: {
            description: "User profile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { user: { $ref: "#/components/schemas/User" } },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/funds": {
      get: {
        security: [{ bearerAuth: [] }],
        summary: "List funds",
        responses: {
          200: {
            description: "Array of funds",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    funds: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Fund" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        security: [{ bearerAuth: [] }],
        summary: "Create a fund (admin)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  name: { type: "string" },
                  description: { type: "string" },
                  currency: { type: "string" },
                  targetAmount: { type: "number" },
                  minCommitment: { type: "number" },
                  status: { type: "string", enum: ["open", "closed"] },
                },
                required: ["code", "name", "targetAmount", "minCommitment"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Fund created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { fund: { $ref: "#/components/schemas/Fund" } },
                },
              },
            },
          },
          403: { description: "Forbidden" },
        },
      },
    },
    "/funds/{id}": {
      get: {
        security: [{ bearerAuth: [] }],
        summary: "Retrieve fund",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: {
            description: "Fund detail",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { fund: { $ref: "#/components/schemas/Fund" } },
                },
              },
            },
          },
          404: { description: "Not found" },
        },
      },
    },
    "/commitments": {
      post: {
        security: [{ bearerAuth: [] }],
        summary: "Create a new commitment",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fundId: { type: "string", format: "uuid" },
                  amount: { type: "number" },
                },
                required: ["fundId", "amount"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Commitment reserved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { commitment: { $ref: "#/components/schemas/Commitment" } },
                },
              },
            },
          },
          400: { description: "Invalid request" },
        },
      },
    },
    "/commitments/me": {
      get: {
        security: [{ bearerAuth: [] }],
        summary: "List commitments for current user",
        responses: {
          200: {
            description: "Commitments",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    commitments: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Commitment" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/commitments/{id}/confirm": {
      patch: {
        security: [{ bearerAuth: [] }],
        summary: "Confirm a commitment",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: {
            description: "Commitment confirmed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { commitment: { $ref: "#/components/schemas/Commitment" } },
                },
              },
            },
          },
        },
      },
    },
    "/commitments/{id}/cancel": {
      patch: {
        security: [{ bearerAuth: [] }],
        summary: "Cancel a commitment",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: {
            description: "Commitment cancelled",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { commitment: { $ref: "#/components/schemas/Commitment" } },
                },
              },
            },
          },
        },
      },
    },
    "/transactions/me": {
      get: {
        security: [{ bearerAuth: [] }],
        summary: "List transactions for current user",
        responses: {
          200: {
            description: "Transactions",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    transactions: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Transaction" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/wallets/me": {
      get: {
        security: [{ bearerAuth: [] }],
        summary: "List wallets",
        responses: {
          200: {
            description: "Wallets",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    wallets: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Wallet" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/wallets": {
      post: {
        security: [{ bearerAuth: [] }],
        summary: "Create wallet",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  address: { type: "string" },
                  chain: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Wallet created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { wallet: { $ref: "#/components/schemas/Wallet" } },
                },
              },
            },
          },
        },
      },
    },
  },
};
