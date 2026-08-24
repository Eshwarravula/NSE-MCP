import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { getBulkDeals } from "../src/tools/bulkDeals.js";
import { getBlockDeals } from "../src/tools/blockDeals.js";
import { getInsiderTrading } from "../src/tools/insiderTrading.js";
import { getLatestBulkDeals } from "../src/tools/latestBulkDeals.js";
import { getTopBulkBuys } from "../src/tools/topBulkBuys.js";
import { getTopBulkSells } from "../src/tools/topBulkSells.js";
import { getFiiDiiActivity } from "../src/tools/fiiDiiActivity.js";
import { getAnnouncements } from "../src/tools/announcements.js";
import { getMarketStatus } from "../src/tools/marketStatus.js";
import { getNiftyIndices } from "../src/tools/indices.js";
import { getTopGainers } from "../src/tools/topGainers.js";
import { getTopLosers } from "../src/tools/topLosers.js";
import { getMostActive } from "../src/tools/mostActive.js";
import { searchBySymbol } from "../src/tools/searchBySymbol.js";
import { getStockQuote } from "../src/tools/quote.js";
import { getShortSelling } from "../src/tools/shortSelling.js";
import { getCorporateActions } from "../src/tools/corporateActions.js";

const tools = [
  {
    name: "get_bulk_deals",
    description: "Today's NSE bulk deals with buyer/seller, quantity and price.",
    inputSchema: { type: "object", properties: { symbol: { type: "string" }, dealType: { type: "string", enum: ["BUY", "SELL", "ALL"] } } },
  },
  {
    name: "get_block_deals",
    description: "Today's NSE block deals with counterparty, quantity and price.",
    inputSchema: { type: "object", properties: { symbol: { type: "string" }, dealType: { type: "string", enum: ["BUY", "SELL", "ALL"] } } },
  },
  {
    name: "get_insider_trading",
    description: "SEBI PIT promoter and insider buy/sell disclosures.",
    inputSchema: { type: "object", properties: { symbol: { type: "string" }, fromDate: { type: "string" }, toDate: { type: "string" } } },
  },
  {
    name: "get_latest_bulk_deals",
    description: "Latest bulk deals sorted by trade value.",
    inputSchema: { type: "object", properties: { dealType: { type: "string", enum: ["BUY", "SELL", "ALL"] } } },
  },
  {
    name: "get_top_bulk_buys",
    description: "Largest bulk-deal purchases ranked by trade value.",
    inputSchema: { type: "object", properties: { limit: { type: "number" }, symbol: { type: "string" } } },
  },
  {
    name: "get_top_bulk_sells",
    description: "Largest bulk-deal sales ranked by trade value.",
    inputSchema: { type: "object", properties: { limit: { type: "number" }, symbol: { type: "string" } } },
  },
  {
    name: "get_fii_dii_activity",
    description: "Recent FII and DII cash-market buy/sell activity.",
    inputSchema: { type: "object", properties: { limit: { type: "number" } } },
  },
  {
    name: "get_nse_announcements",
    description: "Corporate announcements filed with NSE.",
    inputSchema: { type: "object", properties: { symbol: { type: "string" }, daysBack: { type: "number" }, limit: { type: "number" } } },
  },
  {
    name: "get_market_status",
    description: "Current NSE market status and live index levels.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_nifty_indices",
    description: "Live NSE index levels, changes, ranges and breadth.",
    inputSchema: { type: "object", properties: { name: { type: "string" } } },
  },
  {
    name: "get_top_gainers",
    description: "Top gaining NSE stocks within an index.",
    inputSchema: { type: "object", properties: { index: { type: "string" }, limit: { type: "number" } } },
  },
  {
    name: "get_top_losers",
    description: "Top losing NSE stocks within an index.",
    inputSchema: { type: "object", properties: { index: { type: "string" }, limit: { type: "number" } } },
  },
  {
    name: "get_most_active",
    description: "Most actively traded NSE stocks by traded value.",
    inputSchema: { type: "object", properties: { index: { type: "string" }, limit: { type: "number" } } },
  },
  {
    name: "search_by_symbol",
    description: "Combined view of bulk deals, block deals, insider trades and announcements for one NSE stock.",
    inputSchema: { type: "object", properties: { symbol: { type: "string" }, daysBack: { type: "number" } }, required: ["symbol"] },
  },
  {
    name: "get_quote",
    description: "Live NSE/BSE stock quote with valuation and market statistics.",
    inputSchema: { type: "object", properties: { symbol: { type: "string" } }, required: ["symbol"] },
  },
  {
    name: "get_short_selling",
    description: "NSE-reported short-selling quantities under SEBI's short-selling framework.",
    inputSchema: { type: "object", properties: { symbol: { type: "string" }, limit: { type: "number" } } },
  },
  {
    name: "get_corporate_actions",
    description: "Dividends, splits, bonus issues, rights issues and buy-backs with key dates.",
    inputSchema: { type: "object", properties: { symbol: { type: "string" }, fromDate: { type: "string" }, toDate: { type: "string" } } },
  },
];

function createServer() {
  const server = new Server(
    { name: "nse-mcp-cash-equity", version: "0.1.0-vercel" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args } = req.params;
    const a = (args ?? {}) as Record<string, unknown>;
    const str = (key: string) => typeof a[key] === "string" ? a[key] as string : undefined;
    const num = (key: string) => typeof a[key] === "number" ? a[key] as number : undefined;
    const strEnum = <T extends string>(key: string) => typeof a[key] === "string" ? a[key] as T : undefined;

    try {
      let result: unknown;
      switch (name) {
        case "get_bulk_deals":
          result = await getBulkDeals({ symbol: str("symbol"), dealType: strEnum<"BUY" | "SELL" | "ALL">("dealType") });
          break;
        case "get_block_deals":
          result = await getBlockDeals({ symbol: str("symbol"), dealType: strEnum<"BUY" | "SELL" | "ALL">("dealType") });
          break;
        case "get_insider_trading":
          result = await getInsiderTrading({ symbol: str("symbol"), fromDate: str("fromDate"), toDate: str("toDate") });
          break;
        case "get_latest_bulk_deals":
          result = await getLatestBulkDeals({ dealType: strEnum<"BUY" | "SELL" | "ALL">("dealType") });
          break;
        case "get_top_bulk_buys":
          result = await getTopBulkBuys({ limit: num("limit"), symbol: str("symbol") });
          break;
        case "get_top_bulk_sells":
          result = await getTopBulkSells({ limit: num("limit"), symbol: str("symbol") });
          break;
        case "get_fii_dii_activity":
          result = await getFiiDiiActivity({ limit: num("limit") });
          break;
        case "get_nse_announcements":
          result = await getAnnouncements({ symbol: str("symbol"), daysBack: num("daysBack"), limit: num("limit") });
          break;
        case "get_market_status":
          result = await getMarketStatus();
          break;
        case "get_nifty_indices":
          result = await getNiftyIndices({ name: str("name") });
          break;
        case "get_top_gainers":
          result = await getTopGainers({ index: str("index"), limit: num("limit") });
          break;
        case "get_top_losers":
          result = await getTopLosers({ index: str("index"), limit: num("limit") });
          break;
        case "get_most_active":
          result = await getMostActive({ index: str("index"), limit: num("limit") });
          break;
        case "search_by_symbol": {
          const symbol = str("symbol");
          if (!symbol) throw new Error("symbol is required");
          result = await searchBySymbol({ symbol, daysBack: num("daysBack") });
          break;
        }
        case "get_quote": {
          const symbol = str("symbol");
          if (!symbol) throw new Error("symbol is required");
          result = await getStockQuote({ symbol });
          break;
        }
        case "get_short_selling":
          result = await getShortSelling({ symbol: str("symbol"), limit: num("limit") });
          break;
        case "get_corporate_actions":
          result = await getCorporateActions({ symbol: str("symbol"), fromDate: str("fromDate"), toDate: str("toDate") });
          break;
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  });

  return server;
}

export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    return res.status(200).json({ status: "ok", server: "nse-mcp-cash-equity", tools: tools.length });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const accept = String(req.headers.accept || "");
  if (!accept.includes("text/event-stream")) {
    req.headers.accept = "application/json, text/event-stream";
  }

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  res.on("close", () => { transport.close().catch(() => undefined); });

  const server = createServer();
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}
