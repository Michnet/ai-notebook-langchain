
import { ToolIO } from "../types"
import { getMultiRetriever } from "../../utils/database/db"
import { embeddings } from "../../utils/llm/llm"

function toStr(x: unknown) { if (x == null) return ""; if (typeof x === "string") return x; try { return JSON.stringify(x) } catch { return String(x) } }

export const Ragsearch: ToolIO = {
  name: "rag.search",
  desc: "Retrieve top-k passages from namespaces (comma-separated or array) for a query.",
  schema: { type: "object", properties: { q: { type: "string" }, ns: { type: "string" }, k: { type: "number" } }, required: [] },
  run: async (input: any, ctx: Record<string, any>) => {
    const q = toStr(input?.q ?? ctx?.q ?? "").trim()
    const nsInput = input?.ns ?? ctx?.ns ?? "pagelm"

    let namespaces: string[] = []
    if (Array.isArray(nsInput)) {
      namespaces = nsInput.map(toStr)
    } else {
      const s = toStr(nsInput)
      if (s.includes(',')) {
        namespaces = s.split(',').map(x => x.trim())
      } else {
        namespaces = [s || "pagelm"]
      }
    }

    const kNum = Number(input?.k ?? 6); const k = Number.isFinite(kNum) && kNum > 0 ? Math.min(kNum, 20) : 6
    if (!q) return [{ text: "" }]

    // Use multi-retriever
    const retriever = await getMultiRetriever(namespaces, embeddings)
    const docs = await retriever.invoke(q)

    const out = (docs || []).slice(0, k).map((d: any) => ({ text: toStr(d?.pageContent || ""), meta: d?.metadata || {} }))
    return out.length ? out : [{ text: "" }]
  }
}